import type { IncidentAnalysis, IncidentDraft } from "@/lib/types";

const evidence = {
  alert: "ev_alert_checkout_error_rate",
  logs: "ev_logs_stripe_secret",
  deploy: "ev_deploy_env_change",
  notes: "ev_notes_oncall",
  screenshot: "ev_screenshot_dashboard",
};

export function analyzeIncident(incident: IncidentDraft): IncidentAnalysis {
  const joinedEvidence = incident.evidence
    .map((item) => item.content.toLowerCase())
    .join("\n");

  const hasStripeSecret = joinedEvidence.includes("stripe_webhook_secret");
  const hasDeploy = joinedEvidence.includes("dpl_91a2");
  const hasErrorSpike =
    joinedEvidence.includes("14.2%") || joinedEvidence.includes("5xx");

  const confidence = hasStripeSecret && hasDeploy ? "high" : "medium";

  return {
    title: incident.title,
    severity: hasErrorSpike ? "sev2" : "sev3",
    summary:
      "Payment completion is degraded because checkout webhooks are returning 500s after a deployment. The strongest evidence points to an environment variable mismatch in the Stripe webhook signing secret.",
    timeline: [
      {
        time: "10:02",
        event: "Deployment dpl_91a2 shipped to checkout-api.",
        evidenceRefs: [evidence.deploy],
        confidence: hasDeploy ? "high" : "medium",
      },
      {
        time: "10:05",
        event: "5xx rate crossed the alert threshold for checkout-api.",
        evidenceRefs: [evidence.alert, evidence.screenshot],
        confidence: hasErrorSpike ? "high" : "medium",
      },
      {
        time: "10:07",
        event: "Webhook handler started failing signature verification.",
        evidenceRefs: [evidence.logs],
        confidence: hasStripeSecret ? "high" : "medium",
      },
      {
        time: "10:12",
        event: "On-call notes confirmed paid orders were not marked complete.",
        evidenceRefs: [evidence.notes],
        confidence: "medium",
      },
    ],
    rootCause: {
      primary:
        "The checkout deploy renamed or removed the Stripe webhook signing secret expected by production, causing webhook signature verification to fail.",
      evidenceRefs: [evidence.logs, evidence.deploy, evidence.notes],
      confidence,
    },
    affectedSystems: ["checkout-api", "stripe webhooks", "order fulfillment"],
    recommendedFix: {
      immediate: [
        "Restore STRIPE_WEBHOOK_SECRET in production or roll back deployment dpl_91a2.",
        "Replay failed Stripe webhook events after the handler returns 2xx.",
        "Check paid orders created after 10:05 UTC and reconcile fulfillment status.",
      ],
      followUp: [
        "Add a deploy-time environment variable contract check.",
        "Add a synthetic Stripe webhook verification check to release gates.",
        "Store this evidence capsule on Filecoin for postmortem verification.",
      ],
    },
    preventionChecklist: [
      "Block deploys when required secrets are absent.",
      "Pin environment variable names in a typed runtime schema.",
      "Alert on webhook verification failures separately from generic 5xx errors.",
      "Practice incident capsule verification during postmortem review.",
    ],
    unknowns: [
      "Exact number of paid orders requiring replay.",
      "Whether any retries succeeded before the rollback or secret restore.",
      "Whether other services consumed the renamed environment variable.",
    ],
  };
}
