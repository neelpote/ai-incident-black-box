# Filecoin TLDR Cycle 2 Submission

## Logo

Use: `public/blackboxops-logo.svg`

## Project Name

AI Incident Black Box

## Tagline

The black box recorder for AI-powered incident response.

## Description

AI Incident Black Box is a DevOps incident agent that turns outage evidence into a verifiable Filecoin-backed Incident Capsule. An on-call engineer can load logs, alert text, deploy metadata, screenshots, and notes; the agent builds a timeline, identifies the likely root cause, recommends immediate fixes, and packages the entire incident record with cryptographic hashes.

The app is for startup engineering teams and on-call developers who need an audit trail after production incidents. Instead of losing context across Slack threads, dashboards, and AI chat sessions, teams get a replayable postmortem bundle with a CID, piece CID, evidence manifest, and verification flow.

Filecoin is used as the trust layer for incident memory. In real mode, the server stores the Incident Capsule through Filecoin Pin on Calibration or mainnet, uses USDFC auto-funding for the storage payment runway, retrieves the archived JSON, reconstructs the capsule, and compares hashes. A clearly labeled demo simulation is included for no-key previews, but only a `Filecoin Pin` receipt represents a configured real archive.

## Pitch

AI agents are starting to touch production systems, but teams cannot trust an agent they cannot audit. AI Incident Black Box gives every AI-assisted incident response a verifiable memory: what evidence the agent saw, what it concluded, what it recommended, and whether the postmortem still matches the archived record.

The novel part is using Filecoin for operational accountability, not just file upload. Every incident becomes a content-addressed evidence capsule that can be replayed, retrieved, and verified later. This creates a practical trust layer for the future of autonomous DevOps.

## Filecoin Usage

- Generates an Incident Capsule containing raw evidence, timeline, root cause, recommended fix, postmortem, and manifest hashes.
- Stores the capsule through Filecoin Pin when `FILECOIN_STORAGE_MODE=filecoin-pin`.
- Returns an IPFS root CID, Filecoin piece CID when available, network, size, and retrieval URL.
- Invokes Filecoin Pin with `--auto-fund` to maintain USDFC funds in Filecoin Pay; runway and maximum balance are configured server-side.
- Retrieves the archived capsule from the receipt's retrieval URL, reconstructs the incident record in the UI, and then verifies stored manifest/capsule hashes.
- Includes a clearly labeled demo simulation for no-key previews while keeping the same receipt interface.

## Demo Flow

1. Load the sample payment webhook incident.
2. Run the incident agent.
3. Review severity, root cause, immediate fix, unknowns, and replay timeline.
4. Store the Incident Capsule.
5. Review CID, piece CID, network, retrieval URL, and manifest hash.
6. Retrieve the archived capsule and inspect the reconstructed incident record.
7. Verify the receipt.

## Repository

https://github.com/neelpote/ai-incident-black-box

## Live Demo

https://filecoin-two.vercel.app
