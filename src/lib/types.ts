export type Severity = "sev1" | "sev2" | "sev3" | "sev4";
export type Confidence = "low" | "medium" | "high";
export type EvidenceType = "alert" | "logs" | "deploy" | "notes" | "screenshot";

export type EvidenceItem = {
  id: string;
  type: EvidenceType;
  name: string;
  content: string;
  createdAt: string;
  sha256?: string;
};

export type IncidentDraft = {
  id: string;
  title: string;
  service: string;
  createdAt: string;
  evidence: EvidenceItem[];
};

export type TimelineEvent = {
  time: string;
  event: string;
  evidenceRefs: string[];
  confidence: Confidence;
};

export type IncidentAnalysis = {
  title: string;
  severity: Severity;
  summary: string;
  timeline: TimelineEvent[];
  rootCause: {
    primary: string;
    evidenceRefs: string[];
    confidence: Confidence;
  };
  affectedSystems: string[];
  recommendedFix: {
    immediate: string[];
    followUp: string[];
  };
  preventionChecklist: string[];
  unknowns: string[];
};

export type ManifestInput = {
  id: string;
  type: EvidenceType;
  name: string;
  sha256: string;
};

export type IncidentManifest = {
  incidentId: string;
  title: string;
  service: string;
  createdAt: string;
  capsuleVersion: "0.1.0";
  inputs: ManifestInput[];
  agent: {
    name: "blackboxops-local-agent";
    model: "deterministic-demo-agent";
    version: "0.1.0";
  };
  outputs: {
    analysisHash: string;
    timelineHash: string;
    postmortemHash: string;
  };
};

export type IncidentCapsule = {
  incident: IncidentDraft;
  analysis: IncidentAnalysis;
  manifest: IncidentManifest;
  postmortem: string;
  manifestHash: string;
  capsuleHash: string;
};

export type StorageReceipt = {
  mode: "mock-filecoin" | "filecoin-pin";
  network: "mainnet" | "calibration" | "devnet";
  cid: string;
  pieceCid: string | null;
  pieceId?: string | null;
  dataSetId?: string | null;
  transactionHash?: string | null;
  storedAt: string;
  sizeBytes: number;
  retrievalUrl: string;
  manifestHash: string;
  capsuleHash: string;
  rawOutput?: string;
};

export type VerificationResult = {
  status: "verified" | "failed";
  checkedAt: string;
  message: string;
  receipt: StorageReceipt;
  retrievedHash?: string;
};

export type RetrievalResult = {
  status: "retrieved" | "failed";
  retrievedAt: string;
  message: string;
  receipt: StorageReceipt;
  capsule?: IncidentCapsule;
  retrievedHash?: string;
};
