import { fakeCidFromHash, fakePieceCidFromHash, stableStringify } from "@/lib/hash";
import type {
  IncidentCapsule,
  StorageReceipt,
  VerificationResult,
} from "@/lib/types";

export async function storeCapsuleOnMockFilecoin(
  capsule: IncidentCapsule,
): Promise<StorageReceipt> {
  const serialized = stableStringify(capsule);
  const cid = fakeCidFromHash(capsule.capsuleHash);

  return {
    mode: "mock-filecoin",
    network: "calibration",
    cid,
    pieceCid: fakePieceCidFromHash(capsule.manifestHash),
    storedAt: new Date().toISOString(),
    sizeBytes: new Blob([serialized]).size,
    retrievalUrl: `mock://filecoin/calibration/${cid}`,
    manifestHash: capsule.manifestHash,
    capsuleHash: capsule.capsuleHash,
  };
}

export function verifyMockFilecoinReceipt(
  capsule: IncidentCapsule,
  receipt: StorageReceipt,
): VerificationResult {
  const ok =
    receipt.manifestHash === capsule.manifestHash &&
    receipt.capsuleHash === capsule.capsuleHash &&
    receipt.cid === fakeCidFromHash(capsule.capsuleHash);

  return {
    status: ok ? "verified" : "failed",
    checkedAt: new Date().toISOString(),
    message: ok
      ? "This incident capsule matches the Filecoin-backed archive receipt."
      : "The archive receipt does not match the current incident capsule.",
    receipt,
  };
}
