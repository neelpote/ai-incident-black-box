import { sha256, stableStringify } from "@/lib/hash";
import type {
  EvidenceItem,
  IncidentAnalysis,
  IncidentCapsule,
  IncidentDraft,
  IncidentManifest,
} from "@/lib/types";

export async function hashEvidence(
  evidence: EvidenceItem[],
): Promise<EvidenceItem[]> {
  return Promise.all(
    evidence.map(async (item) => ({
      ...item,
      sha256: await sha256(`${item.id}:${item.type}:${item.name}:${item.content}`),
    })),
  );
}

export function buildPostmortem(
  incident: IncidentDraft,
  analysis: IncidentAnalysis,
): string {
  const timeline = analysis.timeline
    .map((event) => `- ${event.time} ${event.event}`)
    .join("\n");

  const immediate = analysis.recommendedFix.immediate
    .map((item) => `- ${item}`)
    .join("\n");

  const prevention = analysis.preventionChecklist
    .map((item) => `- ${item}`)
    .join("\n");

  return `# ${incident.title}

Service: ${incident.service}
Severity: ${analysis.severity.toUpperCase()}

## Summary

${analysis.summary}

## Timeline

${timeline}

## Root Cause

${analysis.rootCause.primary}

## Immediate Fix

${immediate}

## Prevention

${prevention}
`;
}

export async function buildCapsule(
  incident: IncidentDraft,
  analysis: IncidentAnalysis,
): Promise<IncidentCapsule> {
  const evidence = await hashEvidence(incident.evidence);
  const normalizedIncident = { ...incident, evidence };
  const postmortem = buildPostmortem(normalizedIncident, analysis);

  const analysisHash = await sha256(stableStringify(analysis));
  const timelineHash = await sha256(stableStringify(analysis.timeline));
  const postmortemHash = await sha256(postmortem);

  const manifest: IncidentManifest = {
    incidentId: normalizedIncident.id,
    title: normalizedIncident.title,
    service: normalizedIncident.service,
    createdAt: normalizedIncident.createdAt,
    capsuleVersion: "0.1.0",
    inputs: evidence.map((item) => ({
      id: item.id,
      type: item.type,
      name: item.name,
      sha256: item.sha256 ?? "",
    })),
    agent: {
      name: "blackboxops-local-agent",
      model: "deterministic-demo-agent",
      version: "0.1.0",
    },
    outputs: {
      analysisHash,
      timelineHash,
      postmortemHash,
    },
  };

  const manifestHash = await sha256(stableStringify(manifest));
  const capsuleHash = await sha256(
    stableStringify({
      normalizedIncident,
      analysis,
      manifest,
      postmortem,
    }),
  );

  return {
    incident: normalizedIncident,
    analysis,
    manifest,
    postmortem,
    manifestHash,
    capsuleHash,
  };
}
