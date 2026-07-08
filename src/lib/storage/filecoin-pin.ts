import { execFile } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { sha256, stableStringify } from "@/lib/hash";
import type {
  IncidentCapsule,
  StorageReceipt,
  VerificationResult,
} from "@/lib/types";

const execFileAsync = promisify(execFile);

export type FilecoinPinAddResult = {
  cid: string;
  pieceCid: string | null;
  pieceId: string | null;
  dataSetId: string | null;
  transactionHash: string | null;
  retrievalUrl: string | null;
};

export function parseFilecoinPinAddOutput(output: string): FilecoinPinAddResult {
  const cid = matchFirst(output, [
    /(?:IPFS\s*)?Root CID\s*:?\s*(bafy[a-z0-9]+)/i,
    /Root CID\s+(bafy[a-z0-9]+)/i,
    /\b(bafy[a-z0-9]{20,})\b/i,
  ]);

  if (!cid) {
    throw new Error("Filecoin Pin upload completed, but no root CID was found.");
  }

  return {
    cid,
    pieceCid: matchFirst(output, [
      /Piece CID\s*:?\s*(bafk[a-z0-9]+)/i,
      /CommP\s*:?\s*(bafk[a-z0-9]+)/i,
    ]),
    pieceId: matchFirst(output, [/Piece ID\s*:?\s*([0-9]+)/i, /Piece #([0-9]+)/i]),
    dataSetId: matchFirst(output, [
      /Data Set ID\s*:?\s*([0-9]+)/i,
      /Data Set #([0-9]+)/i,
      /#([0-9]+)\s*•\s*live/i,
    ]),
    transactionHash: matchFirst(output, [/Transaction\s*:?\s*(0x[a-f0-9]+)/i]),
    retrievalUrl: matchFirst(output, [
      /Direct Download URL\s*:?\s*(https?:\/\/\S+)/i,
      /(https?:\/\/\S*\/ipfs\/bafy[a-z0-9]+)/i,
    ]),
  };
}

export async function storeCapsuleWithFilecoinPin(
  capsule: IncidentCapsule,
): Promise<StorageReceipt> {
  const privateKey = process.env.PRIVATE_KEY ?? process.env.FILECOIN_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error(
      "Real Filecoin storage requires PRIVATE_KEY or FILECOIN_PRIVATE_KEY in the server environment.",
    );
  }

  const network = getNetwork();
  const serialized = JSON.stringify(capsule, null, 2);
  const tempDir = await mkdtemp(path.join(tmpdir(), "incident-capsule-"));
  const capsulePath = path.join(tempDir, `${capsule.incident.id}.json`);

  await writeFile(capsulePath, serialized, "utf8");

  const command = process.env.FILECOIN_PIN_COMMAND ?? localFilecoinPinCommand();
  const args = [
    "add",
    capsulePath,
    "--network",
    network,
    "--auto-fund",
    "--metadata",
    `app=ai-incident-black-box`,
    "--metadata",
    `incidentId=${capsule.incident.id}`,
    "--metadata",
    `manifestHash=${capsule.manifestHash}`,
    "--metadata",
    `capsuleHash=${capsule.capsuleHash}`,
  ];

  const { stdout, stderr } = await execFileAsync(command, args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PRIVATE_KEY: privateKey,
      NETWORK: network,
    },
    maxBuffer: 1024 * 1024 * 10,
  });

  const rawOutput = `${stdout}\n${stderr}`.trim();
  const result = parseFilecoinPinAddOutput(rawOutput);
  const gatewayUrl = process.env.FILECOIN_GATEWAY_URL?.replace(/\/$/, "");
  const retrievalUrl =
    result.retrievalUrl ??
    (gatewayUrl
      ? `${gatewayUrl}/ipfs/${result.cid}`
      : `https://ipfs.io/ipfs/${result.cid}`);

  return {
    mode: "filecoin-pin",
    network,
    cid: result.cid,
    pieceCid: result.pieceCid,
    pieceId: result.pieceId,
    dataSetId: result.dataSetId,
    transactionHash: result.transactionHash,
    storedAt: new Date().toISOString(),
    sizeBytes: new Blob([serialized]).size,
    retrievalUrl,
    manifestHash: capsule.manifestHash,
    capsuleHash: capsule.capsuleHash,
    rawOutput,
  };
}

export async function verifyFilecoinPinReceipt(
  capsule: IncidentCapsule,
  receipt: StorageReceipt,
): Promise<VerificationResult> {
  if (!receipt.retrievalUrl.startsWith("http")) {
    return {
      status: "failed",
      checkedAt: new Date().toISOString(),
      message: "Real Filecoin verification requires an HTTP retrieval URL.",
      receipt,
    };
  }

  const response = await fetch(receipt.retrievalUrl, {
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      status: "failed",
      checkedAt: new Date().toISOString(),
      message: `Retrieval failed with HTTP ${response.status}.`,
      receipt,
    };
  }

  const storedCapsule = (await response.json()) as IncidentCapsule;
  const retrievedHash = await sha256(stableStringify(storedCapsule));
  const ok =
    storedCapsule.capsuleHash === capsule.capsuleHash &&
    storedCapsule.manifestHash === capsule.manifestHash &&
    receipt.capsuleHash === capsule.capsuleHash &&
    receipt.manifestHash === capsule.manifestHash;

  return {
    status: ok ? "verified" : "failed",
    checkedAt: new Date().toISOString(),
    message: ok
      ? "Retrieved capsule matches the Filecoin Pin archive receipt."
      : "Retrieved capsule does not match the current incident capsule.",
    receipt,
    retrievedHash,
  };
}

function localFilecoinPinCommand() {
  return path.join(process.cwd(), "node_modules", ".bin", "filecoin-pin");
}

function getNetwork(): "mainnet" | "calibration" | "devnet" {
  const network = process.env.FILECOIN_NETWORK ?? process.env.NETWORK ?? "calibration";

  if (network === "mainnet" || network === "calibration" || network === "devnet") {
    return network;
  }

  throw new Error(
    `Unsupported FILECOIN_NETWORK "${network}". Use mainnet, calibration, or devnet.`,
  );
}

function matchFirst(output: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = output.match(pattern);
    if (match?.[1]) {
      return match[1].replace(/[),.;\]]+$/, "");
    }
  }

  return null;
}
