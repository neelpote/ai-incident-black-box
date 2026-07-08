import type {
  IncidentCapsule,
  StorageReceipt,
  VerificationResult,
} from "@/lib/types";
import {
  storeCapsuleWithFilecoinPin,
  verifyFilecoinPinReceipt,
} from "@/lib/storage/filecoin-pin";
import {
  storeCapsuleOnMockFilecoin,
  verifyMockFilecoinReceipt,
} from "@/lib/storage/mock-filecoin";

export function getStorageMode() {
  return process.env.FILECOIN_STORAGE_MODE === "filecoin-pin"
    ? "filecoin-pin"
    : "mock-filecoin";
}

export async function storeCapsule(
  capsule: IncidentCapsule,
): Promise<StorageReceipt> {
  if (getStorageMode() === "filecoin-pin") {
    return storeCapsuleWithFilecoinPin(capsule);
  }

  return storeCapsuleOnMockFilecoin(capsule);
}

export async function verifyCapsule(
  capsule: IncidentCapsule,
  receipt: StorageReceipt,
): Promise<VerificationResult> {
  if (receipt.mode === "filecoin-pin") {
    return verifyFilecoinPinReceipt(capsule, receipt);
  }

  return verifyMockFilecoinReceipt(capsule, receipt);
}
