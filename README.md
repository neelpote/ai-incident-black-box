# AI Incident Black Box

A Filecoin-backed black box recorder for AI-powered incident response.

The app lets an on-call engineer load incident evidence, run a local incident-analysis agent, generate a hashed evidence capsule, store it through Filecoin Pin, and verify that the retrieved capsule still matches the archived receipt.

## What Works Now

- Modern no-gradient incident console UI
- Sample checkout outage scenario
- Deterministic local incident agent
- Timeline replay strip
- Evidence manifest with SHA-256 hashes
- Incident Capsule builder
- Mock Filecoin storage adapter for no-key demos
- Filecoin Pin adapter for real Calibration/mainnet storage
- Separate retrieve-and-reconstruct flow plus receipt verification
- Unit tests for agent, hashes, capsule creation, and verification
- Playwright flow for analyze/store/verify

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For this environment, `npm run start` is more stable than `npm run dev` because the dev file watcher can hit OS limits:

```bash
npm run build
npm run start
```

## Demo Flow

Live demo: [https://filecoin-two.vercel.app](https://filecoin-two.vercel.app)

1. Click `Load sample incident`.
2. Click `Analyze incident`.
3. Review the root cause, immediate fix, unknowns, and replay timeline.
4. Click `Store capsule`.
5. Review the CID, piece CID, network, retrieval URL, and archive mode.
6. Click `Retrieve capsule` to reconstruct the stored Incident Capsule.
7. Click `Verify receipt` to compare the retrieved archive with the local hashes.

## Real Filecoin Mode

The app defaults to mock mode so it works without credentials. To use Filecoin Pin on Calibration:

1. Fund an ETH-compatible Filecoin wallet with Calibration tFIL for gas and test USDFC for Filecoin Pin storage payments.
2. Copy `.env.example` to `.env.local`.
3. Set:

```bash
FILECOIN_STORAGE_MODE=filecoin-pin
FILECOIN_NETWORK=calibration
PRIVATE_KEY=0x...
FILECOIN_MIN_RUNWAY_DAYS=30
FILECOIN_MAX_BALANCE_USDFC=5.00
```

4. Start the app:

```bash
npm run build
npm run start
```

The server stores the Incident Capsule JSON with the local `filecoin-pin` CLI dependency, returns the IPFS root CID and Filecoin piece CID when available, then verifies by retrieving the JSON from the configured gateway.

Before the first upload, initialise Filecoin Pin's USDFC payment approvals and inspect the payment rail:

```bash
npx filecoin-pin payments setup --auto --network calibration
npx filecoin-pin payments status --include-rails --network calibration
```

`filecoin-pin add` is invoked with `--auto-fund`, which deposits USDFC into Filecoin Pay to maintain the configured storage runway. The app never handles or exposes the private key in the browser. Never commit `.env.local` or any private key.

For a judged live proof, set the same server-only variables in Vercel's Production environment, redeploy, store one sample incident, then capture the resulting real Filecoin Pin receipt and the `Retrieve capsule` flow. The UI labels mock receipts as a demo simulation so a real archive is never implied when it is not configured.

## Tests

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

Note: Playwright may be blocked in restricted macOS sandboxes. The app still builds and serves normally.

## Filecoin Integration

Storage is routed through:

```text
src/app/api/storage/store/route.ts
src/app/api/storage/verify/route.ts
src/lib/storage/server.ts
src/lib/storage/filecoin-pin.ts
src/lib/storage/mock-filecoin.ts
```

Set `FILECOIN_STORAGE_MODE=mock` or leave it unset for mock mode. Set `FILECOIN_STORAGE_MODE=filecoin-pin` for real Filecoin Pin mode.

## Project Plan

The full build plan is in:

```text
docs/AI_INCIDENT_BLACK_BOX_BUILD_PLAN.md
```
