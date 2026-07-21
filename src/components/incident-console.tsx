"use client";

import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Clipboard,
  Database,
  Download,
  FileClock,
  Loader2,
  Play,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";

import { analyzeIncident } from "@/lib/agent/incident-agent";
import { buildCapsule } from "@/lib/capsule/build-capsule";
import { sampleIncident } from "@/lib/fixtures/sample-incident";
import type {
  EvidenceItem,
  EvidenceType,
  IncidentAnalysis,
  IncidentCapsule,
  IncidentDraft,
  RetrievalResult,
  StorageReceipt,
  VerificationResult,
} from "@/lib/types";

type Stage =
  | "idle"
  | "analyzing"
  | "capsule"
  | "storing"
  | "stored"
  | "retrieving"
  | "retrieved"
  | "verifying"
  | "verified"
  | "failed";

const emptyIncident: IncidentDraft = {
  id: "inc_draft_payment_webhook",
  title: "Payment webhooks failing after checkout deploy",
  service: "checkout-api",
  createdAt: new Date("2026-07-08T10:02:00.000Z").toISOString(),
  evidence: [
    {
      id: "ev_alert_draft",
      type: "alert",
      name: "Alert text",
      createdAt: new Date("2026-07-08T10:05:00.000Z").toISOString(),
      content: "",
    },
    {
      id: "ev_logs_draft",
      type: "logs",
      name: "Service logs",
      createdAt: new Date("2026-07-08T10:07:00.000Z").toISOString(),
      content: "",
    },
    {
      id: "ev_deploy_draft",
      type: "deploy",
      name: "Deploy metadata",
      createdAt: new Date("2026-07-08T10:02:00.000Z").toISOString(),
      content: "",
    },
    {
      id: "ev_notes_draft",
      type: "notes",
      name: "On-call notes",
      createdAt: new Date("2026-07-08T10:12:00.000Z").toISOString(),
      content: "",
    },
  ],
};

const evidenceLabels: Record<EvidenceType, string> = {
  alert: "Alert",
  logs: "Logs",
  deploy: "Deploy",
  notes: "Notes",
  screenshot: "Screenshot",
};

export function IncidentConsole() {
  const [incident, setIncident] = useState<IncidentDraft>(emptyIncident);
  const [analysis, setAnalysis] = useState<IncidentAnalysis | null>(null);
  const [capsule, setCapsule] = useState<IncidentCapsule | null>(null);
  const [receipt, setReceipt] = useState<StorageReceipt | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(
    null,
  );
  const [retrieval, setRetrieval] = useState<RetrievalResult | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");

  const filledEvidence = useMemo(
    () => incident.evidence.filter((item) => item.content.trim().length > 0),
    [incident.evidence],
  );

  async function runAnalysis() {
    setStage("analyzing");
    setReceipt(null);
    setVerification(null);
    setRetrieval(null);
    setStorageError(null);
    const nextAnalysis = analyzeIncident(incident);
    const nextCapsule = await buildCapsule(incident, nextAnalysis);
    setAnalysis(nextAnalysis);
    setCapsule(nextCapsule);
    setStage("capsule");
  }

  async function storeCapsule() {
    if (!capsule) {
      return;
    }

    setStage("storing");
    setStorageError(null);

    try {
      const response = await fetch("/api/storage/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(capsule),
      });
      const body = (await response.json()) as {
        receipt?: StorageReceipt;
        error?: string;
      };

      if (!response.ok || !body.receipt) {
        throw new Error(body.error ?? "Storage failed.");
      }

      setReceipt(body.receipt);
      setVerification(null);
      setRetrieval(null);
      setStage("stored");
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : "Storage failed.");
      setStage("failed");
    }
  }

  async function verifyCapsule() {
    if (!capsule || !receipt) {
      return;
    }

    setStage("verifying");
    setStorageError(null);

    try {
      const response = await fetch("/api/storage/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capsule, receipt }),
      });
      const body = (await response.json()) as {
        verification?: VerificationResult;
        error?: string;
      };

      if (!response.ok || !body.verification) {
        throw new Error(body.error ?? "Verification failed.");
      }

      setVerification(body.verification);
      setStage(body.verification.status === "verified" ? "verified" : "failed");
    } catch (error) {
      setStorageError(
        error instanceof Error ? error.message : "Verification failed.",
      );
      setStage("failed");
    }
  }

  async function retrieveStoredCapsule() {
    if (!capsule || !receipt) {
      return;
    }

    setStage("retrieving");
    setStorageError(null);

    try {
      const response = await fetch("/api/storage/retrieve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capsule, receipt }),
      });
      const body = (await response.json()) as {
        retrieval?: RetrievalResult;
        error?: string;
      };

      if (!response.ok || !body.retrieval) {
        throw new Error(body.error ?? "Retrieval failed.");
      }

      setRetrieval(body.retrieval);
      setStage(body.retrieval.status === "retrieved" ? "retrieved" : "failed");
    } catch (error) {
      setStorageError(
        error instanceof Error ? error.message : "Retrieval failed.",
      );
      setStage("failed");
    }
  }

  function loadSample() {
    setIncident(sampleIncident);
    setAnalysis(null);
    setCapsule(null);
    setReceipt(null);
    setVerification(null);
    setRetrieval(null);
    setStorageError(null);
    setStage("idle");
  }

  function updateEvidence(id: string, content: string) {
    setIncident((current) => ({
      ...current,
      evidence: current.evidence.map((item) =>
        item.id === id ? { ...item, content } : item,
      ),
    }));
  }

  function addUploadedEvidence(item: EvidenceItem) {
    setIncident((current) => ({
      ...current,
      evidence: [
        ...current.evidence.filter((entry) => entry.id !== item.id),
        item,
      ],
    }));
  }

  return (
    <main className="min-h-screen bg-[var(--recorder-black)] text-[var(--paper-white)] recorder-grid">
      <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <TopBar stage={stage} onLoadSample={loadSample} />

        <section className="grid flex-1 gap-4 py-4 xl:grid-cols-[minmax(360px,0.92fr)_minmax(600px,1.55fr)]">
          <IncidentIntake
            incident={incident}
            filledEvidence={filledEvidence.length}
            onEvidenceChange={updateEvidence}
            onUploadEvidence={addUploadedEvidence}
            onTitleChange={(title) =>
              setIncident((current) => ({ ...current, title }))
            }
            onServiceChange={(service) =>
              setIncident((current) => ({ ...current, service }))
            }
            onAnalyze={runAnalysis}
            isAnalyzing={stage === "analyzing"}
          />

          <section className="flex min-w-0 flex-col gap-4">
            <AnalysisPanel analysis={analysis} />
            <TimelineStrip analysis={analysis} />
            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <EvidenceManifest capsule={capsule} />
              <ArchivePanel
                capsule={capsule}
                receipt={receipt}
                verification={verification}
                retrieval={retrieval}
                storageError={storageError}
                isStoring={stage === "storing"}
                isVerifying={stage === "verifying"}
                isRetrieving={stage === "retrieving"}
                onStore={storeCapsule}
                onVerify={verifyCapsule}
                onRetrieve={retrieveStoredCapsule}
              />
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function TopBar({
  stage,
  onLoadSample,
}: {
  stage: Stage;
  onLoadSample: () => void;
}) {
  return (
    <header className="flex flex-col gap-4 border border-[var(--line)] bg-[rgba(16,17,18,0.92)] p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center border border-[var(--signal-amber)] bg-[var(--panel-graphite)] text-[var(--signal-amber)]">
          <FileClock size={22} />
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--signal-amber)]">
            Filecoin-backed incident recorder
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            AI Incident Black Box
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 border border-[var(--line)] bg-[var(--panel-graphite)] px-3 py-2 font-mono text-xs text-[var(--muted-paper)]">
          <span className="h-2 w-2 bg-[var(--proof-cyan)]" />
          {stage.toUpperCase()}
        </div>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 border border-[var(--paper-white)] px-4 text-sm font-medium text-[var(--paper-white)] transition hover:bg-[var(--paper-white)] hover:text-[var(--recorder-black)] focus:outline-none focus:ring-2 focus:ring-[var(--signal-amber)]"
          onClick={onLoadSample}
          type="button"
        >
          <Play size={16} />
          Load sample incident
        </button>
      </div>
    </header>
  );
}

function IncidentIntake({
  incident,
  filledEvidence,
  isAnalyzing,
  onEvidenceChange,
  onUploadEvidence,
  onTitleChange,
  onServiceChange,
  onAnalyze,
}: {
  incident: IncidentDraft;
  filledEvidence: number;
  isAnalyzing: boolean;
  onEvidenceChange: (id: string, content: string) => void;
  onUploadEvidence: (item: EvidenceItem) => void;
  onTitleChange: (title: string) => void;
  onServiceChange: (service: string) => void;
  onAnalyze: () => void;
}) {
  return (
    <section className="border border-[var(--line)] bg-[rgba(27,29,31,0.96)]">
      <div className="border-b border-[var(--line)] p-4">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted-paper)]">
          Intake
        </p>
        <h2 className="mt-1 text-xl font-semibold">Incident evidence</h2>
      </div>

      <div className="space-y-4 p-4">
        <Field label="Incident title">
          <input
            className="h-11 w-full border border-[var(--line)] bg-[var(--field-gray)] px-3 text-sm outline-none focus:border-[var(--signal-amber)]"
            value={incident.title}
            onChange={(event) => onTitleChange(event.target.value)}
          />
        </Field>

        <Field label="Affected service">
          <input
            className="h-11 w-full border border-[var(--line)] bg-[var(--field-gray)] px-3 font-mono text-sm outline-none focus:border-[var(--signal-amber)]"
            value={incident.service}
            onChange={(event) => onServiceChange(event.target.value)}
          />
        </Field>

        {incident.evidence.map((item) => (
          <Field
            key={item.id}
            label={`${evidenceLabels[item.type]} - ${item.name}`}
          >
            <textarea
              className="min-h-24 w-full resize-y border border-[var(--line)] bg-[var(--field-gray)] p-3 font-mono text-xs leading-5 text-[var(--paper-white)] outline-none placeholder:text-[var(--muted-paper)] focus:border-[var(--signal-amber)]"
              value={item.content}
              placeholder="Paste evidence here..."
              onChange={(event) => onEvidenceChange(item.id, event.target.value)}
            />
          </Field>
        ))}

        <UploadEvidence onUploadEvidence={onUploadEvidence} />

        <div className="flex flex-col gap-3 border-t border-[var(--line)] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-[var(--muted-paper)]">
            {filledEvidence} evidence inputs ready
          </p>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 bg-[var(--signal-amber)] px-4 text-sm font-semibold text-[var(--recorder-black)] transition hover:bg-[var(--paper-white)] focus:outline-none focus:ring-2 focus:ring-[var(--paper-white)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isAnalyzing || filledEvidence === 0}
            onClick={onAnalyze}
            type="button"
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
            Analyze incident
          </button>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-paper)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function UploadEvidence({
  onUploadEvidence,
}: {
  onUploadEvidence: (item: EvidenceItem) => void;
}) {
  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const content = await file.text();
    onUploadEvidence({
      id: `ev_upload_${file.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`,
      type: "logs",
      name: file.name,
      createdAt: new Date().toISOString(),
      content,
    });
  }

  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 border border-dashed border-[var(--line)] bg-[rgba(42,46,49,0.62)] p-3 text-sm text-[var(--muted-paper)] transition hover:border-[var(--proof-cyan)] hover:text-[var(--paper-white)]">
      <span className="inline-flex items-center gap-2">
        <Upload size={16} />
        Upload log file
      </span>
      <span className="font-mono text-xs">.log .txt .json</span>
      <input className="sr-only" type="file" onChange={onFileChange} />
    </label>
  );
}

function AnalysisPanel({ analysis }: { analysis: IncidentAnalysis | null }) {
  return (
    <section className="border border-[var(--line)] bg-[rgba(27,29,31,0.96)]">
      <div className="flex flex-col gap-3 border-b border-[var(--line)] p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted-paper)]">
            Live analysis
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            {analysis ? analysis.title : "Awaiting evidence"}
          </h2>
        </div>
        <SeverityBadge severity={analysis?.severity ?? "sev3"} active={!!analysis} />
      </div>

      {analysis ? (
        <div className="grid gap-4 p-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border border-[var(--line)] bg-[var(--recorder-black)] p-4">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--proof-cyan)]">
              Root cause
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--paper-white)]">
              {analysis.rootCause.primary}
            </p>
            <p className="mt-4 font-mono text-xs text-[var(--muted-paper)]">
              Confidence: {analysis.rootCause.confidence.toUpperCase()}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MiniList title="Immediate fix" items={analysis.recommendedFix.immediate} />
            <MiniList title="Unknowns" items={analysis.unknowns} tone="warning" />
          </div>
        </div>
      ) : (
        <div className="grid min-h-64 place-items-center p-8 text-center">
          <div className="max-w-md">
            <AlertTriangle className="mx-auto text-[var(--signal-amber)]" size={36} />
            <p className="mt-4 text-lg font-medium">Load the sample incident or paste your own evidence.</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-paper)]">
              The local agent will build a timeline, identify the likely root cause, and prepare a Filecoin-ready evidence capsule.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function SeverityBadge({
  severity,
  active,
}: {
  severity: string;
  active: boolean;
}) {
  return (
    <div
      className={`inline-flex h-10 items-center border px-3 font-mono text-sm ${
        active
          ? "border-[var(--failure-red)] text-[var(--failure-red)]"
          : "border-[var(--line)] text-[var(--muted-paper)]"
      }`}
    >
      {severity.toUpperCase()}
    </div>
  );
}

function MiniList({
  title,
  items,
  tone = "default",
}: {
  title: string;
  items: string[];
  tone?: "default" | "warning";
}) {
  return (
    <div className="border border-[var(--line)] bg-[var(--recorder-black)] p-4">
      <p
        className={`font-mono text-xs uppercase tracking-[0.18em] ${
          tone === "warning"
            ? "text-[var(--signal-amber)]"
            : "text-[var(--proof-cyan)]"
        }`}
      >
        {title}
      </p>
      <ul className="mt-3 space-y-3 text-sm leading-5 text-[var(--paper-white)]">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-current" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TimelineStrip({ analysis }: { analysis: IncidentAnalysis | null }) {
  const timeline = analysis?.timeline ?? [];

  return (
    <section className="border border-[var(--line)] bg-[rgba(27,29,31,0.96)] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted-paper)]">
            Replay incident
          </p>
          <h2 className="mt-1 text-xl font-semibold">Timeline recorder strip</h2>
        </div>
        <Play className="text-[var(--signal-amber)]" size={20} />
      </div>

      {timeline.length > 0 ? (
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-[720px] items-stretch">
            {timeline.map((event, index) => (
              <div className="flex min-w-44 flex-1 items-stretch" key={event.time}>
                <div className="flex flex-1 flex-col border border-[var(--line)] bg-[var(--recorder-black)] p-3">
                  <span className="font-mono text-sm text-[var(--signal-amber)]">
                    {event.time}
                  </span>
                  <p className="mt-2 text-sm leading-5">{event.event}</p>
                  <p className="mt-auto pt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--proof-cyan)]">
                    {event.confidence} confidence
                  </p>
                </div>
                {index < timeline.length - 1 ? (
                  <div className="grid w-10 place-items-center">
                    <span className="h-px w-full bg-[var(--signal-amber)]" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted-paper)]">
          Timeline events will appear after analysis.
        </div>
      )}
    </section>
  );
}

function EvidenceManifest({ capsule }: { capsule: IncidentCapsule | null }) {
  return (
    <section className="min-w-0 border border-[var(--line)] bg-[rgba(27,29,31,0.96)]">
      <div className="border-b border-[var(--line)] p-4">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted-paper)]">
          Capsule manifest
        </p>
        <h2 className="mt-1 text-xl font-semibold">Evidence hashes</h2>
      </div>

      {capsule ? (
        <div className="space-y-3 p-4">
          {capsule.manifest.inputs.map((input) => (
            <div
              className="border border-[var(--line)] bg-[var(--recorder-black)] p-3"
              key={input.id}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{input.name}</p>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--proof-cyan)]">
                  {input.type}
                </span>
              </div>
              <p className="hash-break mt-2 font-mono text-[11px] leading-5 text-[var(--muted-paper)]">
                sha256:{input.sha256}
              </p>
            </div>
          ))}
          <div className="border border-[var(--signal-amber)] bg-[var(--recorder-black)] p-3">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--signal-amber)]">
              Manifest hash
            </p>
            <p className="hash-break mt-2 font-mono text-xs text-[var(--paper-white)]">
              {capsule.manifestHash}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 text-sm text-[var(--muted-paper)]">
          Analyze an incident to generate a hashed evidence manifest.
        </div>
      )}
    </section>
  );
}

function ArchivePanel({
  capsule,
  receipt,
  verification,
  retrieval,
  storageError,
  isStoring,
  isVerifying,
  isRetrieving,
  onStore,
  onVerify,
  onRetrieve,
}: {
  capsule: IncidentCapsule | null;
  receipt: StorageReceipt | null;
  verification: VerificationResult | null;
  retrieval: RetrievalResult | null;
  storageError: string | null;
  isStoring: boolean;
  isVerifying: boolean;
  isRetrieving: boolean;
  onStore: () => void;
  onVerify: () => void;
  onRetrieve: () => void;
}) {
  return (
    <section className="min-w-0 border border-[var(--line)] bg-[rgba(27,29,31,0.96)]">
      <div className="border-b border-[var(--line)] p-4">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted-paper)]">
          Filecoin archive
        </p>
        <h2 className="mt-1 text-xl font-semibold">Storage receipt</h2>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3">
          <StatusTile
            icon={<Archive size={18} />}
            label="Capsule"
            value={capsule ? "Ready" : "Waiting"}
          />
          <StatusTile
            icon={<Database size={18} />}
            label="Storage"
            value={
              receipt
                ? receipt.mode === "filecoin-pin"
                  ? "Filecoin Pin"
                  : "Demo simulation"
                : "Not stored"
            }
          />
        </div>

        {receipt ? (
          <div className="space-y-3">
            <ReceiptRow label="CID" value={receipt.cid} />
            <ReceiptRow label="Piece CID" value={receipt.pieceCid ?? "Pending"} />
            {receipt.dataSetId ? (
              <ReceiptRow label="Data set ID" value={receipt.dataSetId} />
            ) : null}
            {receipt.transactionHash ? (
              <ReceiptRow label="Transaction" value={receipt.transactionHash} />
            ) : null}
            <ReceiptRow label="Network" value={receipt.network} />
            <ReceiptRow label="Size" value={`${receipt.sizeBytes} bytes`} />
            <ReceiptRow label="Retrieval" value={receipt.retrievalUrl} />
            <div className="border border-[var(--line)] bg-[var(--recorder-black)] p-3 text-sm leading-6 text-[var(--muted-paper)]">
              {receipt.mode === "filecoin-pin"
                ? "Real archive: Filecoin Pin uploads with USDFC auto-funding enabled for the configured runway."
                : "Demo archive: simulated receipt only. Configure Filecoin Pin with a funded Calibration wallet for a real on-chain archive."}
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-[var(--line)] p-4 text-sm leading-6 text-[var(--muted-paper)]">
            Store the capsule to create a Filecoin receipt. The server uses mock mode by default and switches to Filecoin Pin when configured with a funded wallet.
          </div>
        )}

        {storageError ? (
          <div className="border border-[var(--failure-red)] p-4">
            <div className="flex items-center gap-2 text-[var(--failure-red)]">
              <AlertTriangle size={18} />
              <p className="font-mono text-xs uppercase tracking-[0.16em]">
                Storage error
              </p>
            </div>
            <p className="mt-2 text-sm text-[var(--muted-paper)]">
              {storageError}
            </p>
          </div>
        ) : null}

        {verification ? (
          <div
            className={`border p-4 ${
              verification.status === "verified"
                ? "border-[var(--proof-cyan)]"
                : "border-[var(--failure-red)]"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2
                className={
                  verification.status === "verified"
                    ? "text-[var(--proof-cyan)]"
                    : "text-[var(--failure-red)]"
                }
                size={18}
              />
              <p className="font-mono text-xs uppercase tracking-[0.16em]">
                {verification.status}
              </p>
            </div>
            <p className="mt-2 text-sm text-[var(--muted-paper)]">
              {verification.message}
            </p>
            {verification.retrievedHash ? (
              <p className="hash-break mt-2 font-mono text-[11px] text-[var(--muted-paper)]">
                retrieved:{verification.retrievedHash}
              </p>
            ) : null}
          </div>
        ) : null}

        {retrieval ? (
          <div
            className={`border p-4 ${
              retrieval.status === "retrieved"
                ? "border-[var(--proof-cyan)]"
                : "border-[var(--failure-red)]"
            }`}
          >
            <div className="flex items-center gap-2">
              <Download
                className={
                  retrieval.status === "retrieved"
                    ? "text-[var(--proof-cyan)]"
                    : "text-[var(--failure-red)]"
                }
                size={18}
              />
              <p className="font-mono text-xs uppercase tracking-[0.16em]">
                {retrieval.status === "retrieved"
                  ? "Capsule retrieved"
                  : "Retrieval failed"}
              </p>
            </div>
            <p className="mt-2 text-sm text-[var(--muted-paper)]">
              {retrieval.message}
            </p>
            {retrieval.capsule ? (
              <div className="mt-3 border border-[var(--line)] bg-[var(--recorder-black)] p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--proof-cyan)]">
                  Reconstructed capsule
                </p>
                <p className="mt-2 text-sm font-medium">
                  {retrieval.capsule.incident.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-paper)]">
                  {retrieval.capsule.analysis.rootCause.primary}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <button
            className="inline-flex h-11 items-center justify-center gap-2 border border-[var(--signal-amber)] px-3 text-sm font-semibold text-[var(--signal-amber)] transition hover:bg-[var(--signal-amber)] hover:text-[var(--recorder-black)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!capsule || isStoring}
            onClick={onStore}
            type="button"
          >
            {isStoring ? <Loader2 className="animate-spin" size={16} /> : <Database size={16} />}
            {isStoring ? "Storing" : "Store capsule"}
          </button>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 border border-[var(--paper-white)] px-3 text-sm font-semibold text-[var(--paper-white)] transition hover:bg-[var(--paper-white)] hover:text-[var(--recorder-black)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!receipt || isRetrieving}
            onClick={onRetrieve}
            type="button"
          >
            {isRetrieving ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            {isRetrieving ? "Retrieving" : "Retrieve capsule"}
          </button>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 border border-[var(--proof-cyan)] px-3 text-sm font-semibold text-[var(--proof-cyan)] transition hover:bg-[var(--proof-cyan)] hover:text-[var(--recorder-black)] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!receipt || isVerifying}
            onClick={onVerify}
            type="button"
          >
            {isVerifying ? <Loader2 className="animate-spin" size={16} /> : <Clipboard size={16} />}
            {isVerifying ? "Verifying" : "Verify receipt"}
          </button>
        </div>
      </div>
    </section>
  );
}

function StatusTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-[var(--line)] bg-[var(--recorder-black)] p-3">
      <div className="flex items-center gap-2 text-[var(--proof-cyan)]">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-[0.16em]">
          {label}
        </span>
      </div>
      <p className="mt-3 text-sm font-medium">{value}</p>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--line)] bg-[var(--recorder-black)] p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted-paper)]">
        {label}
      </p>
      <p className="hash-break mt-2 font-mono text-xs text-[var(--paper-white)]">
        {value}
      </p>
    </div>
  );
}
