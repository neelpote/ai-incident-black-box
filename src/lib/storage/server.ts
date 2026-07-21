import type {
  IncidentCapsule,
  RetrievalResult,
  StorageReceipt,
  VerificationResult,
} from "@/lib/types";
import {
  retrieveFilecoinPinCapsule,
  storeCapsuleWithFilecoinPin,
  verifyFilecoinPinReceipt,
} from "@/lib/storage/filecoin-pin";
import {
  retrieveMockFilecoinCapsule,
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

export async function retrieveCapsule(
  capsule: IncidentCapsule,
  receipt: StorageReceipt,
): Promise<RetrievalResult> {
  if (receipt.mode === "filecoin-pin") {
    return retrieveFilecoinPinCapsule(receipt);
  }

  return retrieveMockFilecoinCapsule(capsule, receipt);
}
