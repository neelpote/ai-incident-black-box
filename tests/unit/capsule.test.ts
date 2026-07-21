import { describe, expect, it } from "vitest";

import { analyzeIncident } from "@/lib/agent/incident-agent";
import { buildCapsule } from "@/lib/capsule/build-capsule";
import { sampleIncident } from "@/lib/fixtures/sample-incident";
import { sha256 } from "@/lib/hash";
import { parseFilecoinPinAddOutput } from "@/lib/storage/filecoin-pin";
import {
  retrieveMockFilecoinCapsule,
  storeCapsuleOnMockFilecoin,
  verifyMockFilecoinReceipt,
} from "@/lib/storage/mock-filecoin";

describe("incident capsule", () => {
  it("creates hashes for every evidence input", async () => {
    const analysis = analyzeIncident(sampleIncident);
    const capsule = await buildCapsule(sampleIncident, analysis);

    expect(capsule.manifest.inputs).toHaveLength(sampleIncident.evidence.length);
    expect(capsule.manifest.inputs.every((input) => input.sha256.length === 64)).toBe(
      true,
    );
    expect(capsule.manifestHash).toHaveLength(64);
    expect(capsule.capsuleHash).toHaveLength(64);
  });

  it("changes the capsule hash when evidence changes", async () => {
    const analysis = analyzeIncident(sampleIncident);
    const first = await buildCapsule(sampleIncident, analysis);
    const changedIncident = {
      ...sampleIncident,
      evidence: sampleIncident.evidence.map((item, index) =>
        index === 0 ? { ...item, content: `${item.content}\nnew alert detail` } : item,
      ),
    };
    const second = await buildCapsule(changedIncident, analyzeIncident(changedIncident));

    expect(first.capsuleHash).not.toBe(second.capsuleHash);
  });

  it("verifies a mock Filecoin receipt against the capsule", async () => {
    const analysis = analyzeIncident(sampleIncident);
    const capsule = await buildCapsule(sampleIncident, analysis);
    const receipt = await storeCapsuleOnMockFilecoin(capsule);
    const verification = verifyMockFilecoinReceipt(capsule, receipt);

    expect(receipt.cid.startsWith("bafy")).toBe(true);
    expect(verification.status).toBe("verified");
  });

  it("retrieves a mock capsule from a matching receipt", async () => {
    const analysis = analyzeIncident(sampleIncident);
    const capsule = await buildCapsule(sampleIncident, analysis);
    const receipt = await storeCapsuleOnMockFilecoin(capsule);
    const retrieval = await retrieveMockFilecoinCapsule(capsule, receipt);

    expect(retrieval.status).toBe("retrieved");
    expect(retrieval.capsule?.capsuleHash).toBe(capsule.capsuleHash);
  });

  it("produces stable sha256 hashes", async () => {
    await expect(sha256("blackboxops")).resolves.toBe(
      "6eb9f32eecf8dab5f089848d874f513e8e0b19739bc83d1a76ffdf778a2fd807",
    );
  });

  it("parses Filecoin Pin CLI upload output", () => {
    const parsed = parseFilecoinPinAddOutput(`
      Root CID: bafybeibh422kjvgfmymx6nr7jandwngrown6ywomk4vplayl4de2x553t4
      Piece CID: bafkzcibcfab4grpgq6e6rva4kfuxfcvibdzx3kn2jdw6q3zqgwt5cou7j6k4wfq
      Piece ID: 0
      Data Set ID: 325
      Transaction: 0xc85e49d2ed745cc8c5d7115e7c45a1243ec25da7e73e224a744887783afea42b
      Direct Download URL: https://calib.ezpdpz.net/piece/bafkzcibcfab4grpgq6e6rva4kfuxfcvibdzx3kn2jdw6q3zqgwt5cou7j6k4wfq
    `);

    expect(parsed.cid).toBe(
      "bafybeibh422kjvgfmymx6nr7jandwngrown6ywomk4vplayl4de2x553t4",
    );
    expect(parsed.pieceCid).toBe(
      "bafkzcibcfab4grpgq6e6rva4kfuxfcvibdzx3kn2jdw6q3zqgwt5cou7j6k4wfq",
    );
    expect(parsed.dataSetId).toBe("325");
    expect(parsed.transactionHash).toBe(
      "0xc85e49d2ed745cc8c5d7115e7c45a1243ec25da7e73e224a744887783afea42b",
    );
  });
});
