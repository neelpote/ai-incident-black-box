import type { IncidentDraft } from "@/lib/types";

export const sampleIncident: IncidentDraft = {
  id: "inc_2026_07_08_payment_webhook",
  title: "Payment webhooks failing after checkout deploy",
  service: "checkout-api",
  createdAt: "2026-07-08T10:02:00.000Z",
  evidence: [
    {
      id: "ev_alert_checkout_error_rate",
      type: "alert",
      name: "Datadog alert",
      createdAt: "2026-07-08T10:05:00.000Z",
      content:
        "10:05 UTC alert: checkout-api 5xx rate crossed 14.2%. Endpoint /api/webhooks/stripe failing after deployment dpl_91a2.",
    },
    {
      id: "ev_logs_stripe_secret",
      type: "logs",
      name: "api-errors.log",
      createdAt: "2026-07-08T10:07:00.000Z",
      content:
        "10:06:51 checkout-api error StripeSignatureVerificationError: Missing env STRIPE_WEBHOOK_SECRET\n10:07:18 checkout-api warn retry exhausted for invoice.payment_succeeded\n10:08:02 checkout-api error webhook handler returned 500 for event evt_9130",
    },
    {
      id: "ev_deploy_env_change",
      type: "deploy",
      name: "deploy-metadata.json",
      createdAt: "2026-07-08T10:02:00.000Z",
      content:
        '{"deployId":"dpl_91a2","service":"checkout-api","commit":"4f6aa1d","changes":["renamed STRIPE_WEBHOOK_SECRET to STRIPE_SIGNING_SECRET in env schema","updated webhook handler validation"],"author":"release-bot"}',
    },
    {
      id: "ev_notes_oncall",
      type: "notes",
      name: "oncall-notes.md",
      createdAt: "2026-07-08T10:12:00.000Z",
      content:
        "Users can create checkout sessions, but paid orders are not marked complete. Manual retry works after setting STRIPE_WEBHOOK_SECRET in staging. Production rollback is available.",
    },
    {
      id: "ev_screenshot_dashboard",
      type: "screenshot",
      name: "error-spike-screenshot.txt",
      createdAt: "2026-07-08T10:09:00.000Z",
      content:
        "Screenshot description: monitoring graph shows checkout-api 5xx spike from 0.2% to 14.2% five minutes after dpl_91a2.",
    },
  ],
};
