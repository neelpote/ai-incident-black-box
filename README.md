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
- Receipt verification flow with retrieval check in real mode
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

1. Click `Load sample incident`.
2. Click `Analyze incident`.
3. Review the root cause, immediate fix, unknowns, and replay timeline.
4. Click `Store capsule`.
5. Review the Filecoin CID and piece CID.
6. Click `Verify receipt`.

## Real Filecoin Mode

The app defaults to mock mode so it works without credentials. To use Filecoin Pin on Calibration:

1. Fund an ETH-compatible Filecoin wallet with Calibration tFIL and test USDFC.
2. Copy `.env.example` to `.env.local`.
3. Set:

```bash
FILECOIN_STORAGE_MODE=filecoin-pin
FILECOIN_NETWORK=calibration
PRIVATE_KEY=0x...
```

4. Start the app:

```bash
npm run build
npm run start
```

The server stores the Incident Capsule JSON with the local `filecoin-pin` CLI dependency, returns the IPFS root CID and Filecoin piece CID when available, then verifies by retrieving the JSON from the configured gateway.

Useful setup command before first upload:

```bash
npx filecoin-pin payments setup --auto --network calibration
```

Never commit `.env.local` or any private key.

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
