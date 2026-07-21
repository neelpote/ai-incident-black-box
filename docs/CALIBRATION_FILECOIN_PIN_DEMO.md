# Real Filecoin Pin Demo Checklist

This checklist turns the public demo from a clearly labeled simulation into a real Calibration Filecoin archive.

## 1. Prepare a dedicated demo wallet

Use a throwaway EVM-compatible wallet. Fund it with Calibration tFIL for gas and test USDFC for Filecoin Pin payments. Do not use a personal or production wallet.

## 2. Initialise USDFC payments

Run these commands locally with the wallet key in a local-only environment file:

```bash
npx filecoin-pin payments setup --auto --network calibration
npx filecoin-pin payments status --include-rails --network calibration
```

The first command creates the Filecoin Pay payment approvals. The second provides the payment-rail output to capture in the demo evidence.

## 3. Configure Vercel production

Add the following server-only production variables in Vercel. Never prefix them with `NEXT_PUBLIC_`.

```text
FILECOIN_STORAGE_MODE=filecoin-pin
FILECOIN_NETWORK=calibration
PRIVATE_KEY=0x...
FILECOIN_MIN_RUNWAY_DAYS=30
FILECOIN_MAX_BALANCE_USDFC=5.00
FILECOIN_GATEWAY_URL=https://ipfs.io
```

Redeploy after saving the variables.

## 4. Capture the proof

In the deployed console:

1. Load the sample incident and analyze it.
2. Store the capsule. Confirm the receipt says `Filecoin Pin`, not `Demo simulation`.
3. Capture the real CID, piece CID, transaction hash if returned, and retrieval URL.
4. Click `Retrieve capsule` and show the reconstructed incident title and root cause.
5. Click `Verify receipt` and show `VERIFIED`.

The resulting video should show the Filecoin primitive at every stage: archive, retrieval, and integrity verification.
