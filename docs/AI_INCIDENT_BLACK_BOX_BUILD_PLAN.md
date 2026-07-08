# AI Incident Black Box Build Plan

## 1. Product Thesis

**AI Incident Black Box** is a DevOps incident agent that investigates outages, creates a precise incident timeline, recommends a fix, and stores the full incident evidence bundle on Filecoin.

The product is not a generic DevOps chatbot. It is a black box recorder for AI-assisted operations. When a production incident happens, the team can later prove:

- what signals were available
- what the agent inspected
- what the agent concluded
- what fix was recommended
- what evidence supported the conclusion
- whether the archived record still matches the original incident data

### One-line pitch

The black box recorder for AI-powered incident response.

### Hackathon positioning

This directly fits the challenge theme: **an AI agent that uses Filecoin for memory, logs, datasets, proofs, or storage**.

Filecoin is central to the product because the incident record must remain retrievable, content-addressed, and independently verifiable after the outage is resolved.

## 2. Target User

Primary user:

- startup engineering teams
- solo founders running production apps
- DevOps engineers
- on-call developers
- hackathon teams deploying fast and breaking things

Pain:

- incident context is scattered across Slack, logs, dashboards, deploys, and screenshots
- AI recommendations are difficult to audit later
- postmortems are often written after memory has already faded
- companies need proof of what happened during downtime

## 3. MVP Scope

The first version should be a polished demo, not a full observability platform.

### Core workflow

1. User creates an incident.
2. User uploads or pastes:
   - server logs
   - deployment notes
   - alert text
   - incident notes
   - optional screenshot
3. AI agent analyzes the incident.
4. App generates:
   - incident timeline
   - suspected root cause
   - blast radius
   - recommended fix
   - prevention checklist
   - evidence manifest
5. App packages the incident as an **Incident Capsule**.
6. Incident Capsule is stored on Filecoin.
7. App displays a verification page with:
   - incident ID
   - Filecoin CID or piece CID
   - evidence hashes
   - retrieval status
   - replayable timeline
   - final postmortem

### Demo incident

Use a realistic synthetic incident:

- payment API errors after a deploy
- error rate jumps from 0.2% to 14%
- logs show missing `STRIPE_WEBHOOK_SECRET`
- deployment changed environment variable names
- agent recommends rollback or env var restore
- postmortem explains prevention steps

This is easy for judges to understand in under 2 minutes.

## 4. Differentiating Features

### 4.1 Replay Incident

The verification page should include a replay mode:

```text
10:02 Deploy shipped
10:05 Error rate increased
10:07 Payment webhook failures started
10:09 Agent found missing environment variable
10:12 Rollback recommended
10:20 Incident resolved
```

This makes the demo visual and memorable.

### 4.2 Evidence Manifest

Every uploaded input should be hashed locally or server-side and included in a manifest:

```json
{
  "incidentId": "inc_2026_07_08_payment_webhook",
  "createdAt": "2026-07-08T10:00:00Z",
  "inputs": [
    {
      "type": "logs",
      "name": "api-errors.log",
      "sha256": "..."
    },
    {
      "type": "deploy",
      "name": "deploy-metadata.json",
      "sha256": "..."
    }
  ],
  "agent": {
    "model": "configured-model-name",
    "version": "0.1.0"
  },
  "outputs": {
    "rootCauseHash": "...",
    "timelineHash": "...",
    "postmortemHash": "..."
  }
}
```

### 4.3 Verify From Filecoin

The verification page should retrieve the stored capsule and compare:

- stored manifest hash
- current downloaded file hash
- displayed timeline hash
- displayed postmortem hash

Result:

```text
Verified: this incident capsule matches the Filecoin-backed archive.
```

## 5. Filecoin Integration

Use one of these implementation paths.

### Preferred path: Filecoin Onchain Cloud with Synapse SDK

Use Synapse SDK for storing and retrieving the Incident Capsule.

Why:

- current Filecoin developer path
- JavaScript/TypeScript friendly
- supports app integration
- fits a Next.js project
- exposes upload/download flows

Reference:

- https://docs.filecoin.cloud/
- https://github.com/FilOzone/synapse-sdk

Expected stored files:

```text
incident-capsule/
  manifest.json
  raw/
    logs.txt
    alert.txt
    deploy.json
    notes.md
    screenshot.png
  agent/
    timeline.json
    root-cause.md
    recommended-fix.md
    postmortem.md
```

### Alternative path: Filecoin Pin

Use Filecoin Pin if the fastest route is IPFS-compatible persistence plus Filecoin proofs.

Why:

- good for Filecoin-visible demos
- CLI is easy to show
- aligns with agent metadata and persistent records

Reference:

- https://docs.filecoin.io/builder-cookbook/filecoin-pin
- https://docs.filecoin.io/builder-cookbook/filecoin-pin/filecoin-pin-cli

### Demo fallback

If testnet funding or network issues block live Filecoin storage during development, keep a local storage adapter with the same interface:

```ts
interface StorageAdapter {
  uploadCapsule(capsulePath: string): Promise<StorageReceipt>;
  downloadCapsule(receipt: StorageReceipt): Promise<ArrayBuffer>;
  verifyCapsule(receipt: StorageReceipt): Promise<VerificationResult>;
}
```

Adapters:

- `MockFilecoinStorageAdapter`
- `SynapseStorageAdapter`
- `FilecoinPinStorageAdapter`

The UI should clearly show when mock storage is active. For final submission, use real Filecoin testnet or mainnet storage if possible.

## 6. Architecture

### Recommended stack

- Next.js App Router
- TypeScript
- Tailwind CSS or plain CSS modules
- shadcn/ui only if needed for accessible primitives
- lucide-react for icons
- OpenAI, Anthropic, or local LLM provider for incident analysis
- Synapse SDK or Filecoin Pin for storage
- Playwright for end-to-end testing
- Vitest for unit tests

### High-level system

```text
User
  |
  v
Incident Intake UI
  |
  v
API: create incident
  |
  v
Incident Parser
  |
  v
AI Incident Agent
  |
  v
Capsule Builder
  |
  +--> Hash Manifest
  +--> Filecoin Storage Adapter
  +--> Local DB metadata
  |
  v
Verification Page
```

### Suggested folders

```text
app/
  page.tsx
  incidents/
    new/page.tsx
    [id]/page.tsx
    [id]/verify/page.tsx
  api/
    incidents/route.ts
    incidents/[id]/analyze/route.ts
    incidents/[id]/store/route.ts
    incidents/[id]/verify/route.ts
components/
  incident-intake.tsx
  timeline-replay.tsx
  evidence-manifest.tsx
  verification-card.tsx
  storage-receipt.tsx
lib/
  agent/
    incident-agent.ts
    prompts.ts
    schemas.ts
  capsule/
    build-capsule.ts
    hash.ts
    manifest.ts
  storage/
    adapter.ts
    mock-filecoin.ts
    synapse.ts
    filecoin-pin.ts
  fixtures/
    sample-incident.ts
tests/
  unit/
  e2e/
```

## 7. AI Agent Design

### Agent responsibilities

The agent should produce structured output, not free-form chat.

Required output:

```ts
type IncidentAnalysis = {
  title: string;
  severity: "sev1" | "sev2" | "sev3" | "sev4";
  summary: string;
  timeline: Array<{
    time: string;
    event: string;
    evidenceRefs: string[];
    confidence: "low" | "medium" | "high";
  }>;
  rootCause: {
    primary: string;
    evidenceRefs: string[];
    confidence: "low" | "medium" | "high";
  };
  affectedSystems: string[];
  recommendedFix: {
    immediate: string[];
    followUp: string[];
  };
  preventionChecklist: string[];
  unknowns: string[];
};
```

### Prompt shape

The system prompt should tell the agent:

- be conservative
- cite evidence references
- separate facts from assumptions
- never invent log lines
- output strict JSON
- include unknowns when evidence is missing

### Agent guardrails

Do not let the agent claim certainty unless logs support it.

Good:

```text
The strongest evidence points to a missing webhook secret after deploy dpl_91a.
```

Bad:

```text
The system definitely failed because of Stripe.
```

## 8. Frontend Direction

The frontend must be unique, modern, and must not use gradients.

The installed `frontend-design` skill is for making the UI distinctive rather than templated. The design should feel like an operational console mixed with an aircraft-style incident recorder.

### Visual concept

**Black box operations desk**

The interface should look like a precise incident command surface:

- dense but readable
- timeline-first
- evidence-first
- calm under pressure
- no marketing hero
- no decorative gradient
- no generic SaaS cards everywhere

### Palette

Use a restrained, non-gradient palette:

```text
Recorder Black     #101112
Panel Graphite     #1B1D1F
Field Gray         #2A2E31
Paper White        #F4F2EC
Signal Amber       #F2A93B
Proof Cyan         #3EC7C2
Failure Red        #D85C4A
```

Avoid making the whole app dark-blue, purple, beige, or gradient-heavy.

### Typography

Recommended pairing:

- display: `IBM Plex Mono` or `Space Mono`
- body: `Inter`, `Geist`, or `Source Sans 3`
- data labels: same mono face, smaller size

The mono face should be used for timestamps, hashes, CIDs, severity labels, and replay events.

### Signature UI element

The signature element should be a **timeline recorder strip**:

```text
[10:02 DEPLOY]----[10:05 ERROR SPIKE]----[10:07 WEBHOOK FAIL]----[10:12 FIX]
```

Each event should expand to show:

- evidence reference
- agent confidence
- hash link
- raw log excerpt

### Layout

First screen should be the app itself:

```text
┌──────────────────────────────────────────────────────────────┐
│ AI Incident Black Box                         New Incident   │
├──────────────────────────────────────────────────────────────┤
│ Incident Intake              │ Live Analysis                 │
│ - Alert text                 │ - Severity                    │
│ - Logs                       │ - Root cause                  │
│ - Deploy metadata            │ - Fix                         │
│ - Screenshot                 │ - Unknowns                    │
├──────────────────────────────┴───────────────────────────────┤
│ Timeline Recorder Strip                                      │
├──────────────────────────────────────────────────────────────┤
│ Evidence Manifest        Storage Receipt        Verify       │
└──────────────────────────────────────────────────────────────┘
```

### UI rules

- no gradients
- no decorative blob backgrounds
- no oversized landing page hero
- no nested cards
- use icons for actions where obvious
- use clear labels for incident controls
- keep text inside buttons short
- make CIDs copyable
- make verification status impossible to miss
- include mobile layout, but optimize first for laptop demo

## 9. Required Skills

### Downloaded skill

Installed into this project:

```text
.agents/skills/frontend-design
```

Install command used:

```bash
npx skills add https://github.com/anthropics/skills --skill frontend-design
```

Use it when designing or changing the frontend.

### Recommended local skills to use during development

These are not external project dependencies, but they are useful working practices:

- frontend design review before UI implementation
- accessibility and responsive QA
- browser-based visual verification
- React component quality review
- Filecoin docs review before storage integration

## 10. Environment Variables

Create `.env.local` when implementation begins:

```bash
# AI provider
OPENAI_API_KEY=
# or
ANTHROPIC_API_KEY=

# Filecoin storage
FILECOIN_STORAGE_MODE=mock
FILECOIN_PRIVATE_KEY=
FILECOIN_RPC_URL=
FILECOIN_NETWORK=calibration

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Do not commit private keys or real API keys.

## 11. Implementation Plan

### Phase 1: Project bootstrap

1. Create Next.js TypeScript app.
2. Add linting and formatting.
3. Add Playwright and Vitest.
4. Add Tailwind or CSS modules.
5. Add lucide-react icons.
6. Create fixture incident data.

Acceptance:

- app starts locally
- homepage renders incident console
- sample incident fixture loads

### Phase 2: Incident intake

Build the intake screen:

- alert text field
- log upload
- deploy metadata upload or paste
- incident notes field
- screenshot upload
- sample incident button

Acceptance:

- user can load sample incident
- uploaded files are listed in evidence panel
- evidence items get local IDs

### Phase 3: Agent analysis

Build agent route:

```text
POST /api/incidents/:id/analyze
```

It should:

- read incident inputs
- call AI model
- validate structured JSON output
- store analysis result locally
- return timeline and recommendations

Acceptance:

- sample incident produces stable analysis
- malformed model output is handled
- agent lists unknowns instead of inventing facts

### Phase 4: Capsule builder

Build the capsule generator:

- normalize uploaded files
- create manifest
- calculate SHA-256 hashes
- save analysis JSON
- save postmortem markdown
- package as folder or zip

Acceptance:

- manifest includes every evidence item
- hash changes if evidence changes
- capsule can be rebuilt deterministically from stored metadata

### Phase 5: Filecoin storage

Build storage adapter:

```text
POST /api/incidents/:id/store
```

Start with mock adapter, then implement Synapse or Filecoin Pin.

Acceptance:

- mock mode returns fake but realistic receipt
- real mode uploads capsule to Filecoin
- receipt is saved with incident
- verification page can display CID or piece CID

### Phase 6: Verification page

Build:

```text
/incidents/:id/verify
```

It should show:

- incident status
- storage receipt
- CID or piece CID
- manifest hash
- evidence list
- replay timeline
- verification result

Acceptance:

- user can click verify
- downloaded capsule hash is compared
- mismatch creates a clear failure state

### Phase 7: Demo polish

Add:

- replay animation with reduced-motion fallback
- copy CID button
- downloadable postmortem
- sample incident reset
- public demo seed data

Acceptance:

- judge can understand the product in 30 seconds
- no broken buttons
- all demo states are available without manual setup

## 12. Testing Plan

### Unit tests

Test:

- SHA-256 hash generation
- manifest generation
- capsule packaging
- AI output schema validation
- storage adapter interface
- verification comparison logic

Example test cases:

```text
manifest includes all uploaded files
same input creates same manifest hash
changed log line changes manifest hash
analysis without evidenceRefs fails validation
verify succeeds when downloaded hash matches
verify fails when downloaded hash differs
```

### Integration tests

Test API routes:

```text
POST /api/incidents
POST /api/incidents/:id/analyze
POST /api/incidents/:id/store
POST /api/incidents/:id/verify
```

Use mock AI and mock Filecoin in CI.

### End-to-end tests

Playwright flow:

1. Open homepage.
2. Click sample incident.
3. Run analysis.
4. Confirm timeline appears.
5. Store capsule.
6. Open verification page.
7. Click verify.
8. Confirm verified status.

### Visual QA

Check:

- desktop 1440px
- laptop 1280px
- tablet 768px
- mobile 390px

Look for:

- text overflow
- timeline overlap
- unreadable hash/CID text
- buttons resizing on hover
- clipped upload labels
- inaccessible focus states
- accidental gradients

### Manual Filecoin test

Before submission:

1. Set `FILECOIN_STORAGE_MODE` to real adapter.
2. Fund test wallet if needed.
3. Store one sample incident.
4. Copy the returned CID or piece CID.
5. Retrieve the capsule.
6. Verify hash locally.
7. Record the screen for the demo.

## 13. Demo Script

Use this script for the final video.

```text
This is AI Incident Black Box, a black box recorder for AI-powered incident response.

I am loading a real-looking production outage: payment webhooks started failing after a deploy.

The agent reads the logs, deploy notes, alert text, and screenshot. It builds a timeline, identifies the likely root cause, and recommends an immediate fix.

Now the important part: the incident is packaged as an evidence capsule and stored on Filecoin.

The verification page shows the CID, evidence hashes, the replayable timeline, and a verification check.

This means the team can later prove what the AI agent saw, what it recommended, and whether the postmortem still matches the archived evidence.
```

## 14. Submission Checklist

Required:

- live demo link
- GitHub repo link
- short product description
- explanation of how Filecoin is used
- AI build log
- public X post
- demo video or GIF

Technical proof:

- show CID or piece CID in UI
- show Filecoin retrieval or verification
- show stored manifest
- show replay timeline
- show raw evidence references

## 15. Judging Narrative

Best framing:

```text
AI agents are starting to touch production systems, but teams cannot trust an agent they cannot audit. AI Incident Black Box gives every incident response agent a verifiable memory. Filecoin stores the evidence capsule so the postmortem can be replayed and verified after the outage.
```

Avoid saying:

```text
It uploads logs to Filecoin.
```

Say:

```text
It turns every AI-assisted incident response into a verifiable Filecoin-backed evidence capsule.
```

## 16. Stretch Goals

Only add these after the core demo works:

- GitHub deployment diff ingestion
- Vercel deployment metadata ingestion
- Slack incident transcript import
- PagerDuty/Opsgenie alert import
- incident challenge comments stored as new Filecoin capsules
- ERC-8004 agent card stored with Filecoin Pin
- multi-agent review: root-cause agent, security agent, prevention agent

## 17. Immediate Next Steps

1. Bootstrap the app.
2. Build the sample incident flow.
3. Implement manifest and hashing.
4. Implement mock storage adapter.
5. Build replay and verification UI.
6. Add real Filecoin storage adapter.
7. Record the final demo.

