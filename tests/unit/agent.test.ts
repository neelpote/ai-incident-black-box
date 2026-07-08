import { describe, expect, it } from "vitest";

import { analyzeIncident } from "@/lib/agent/incident-agent";
import { sampleIncident } from "@/lib/fixtures/sample-incident";

describe("incident agent", () => {
  it("returns a conservative structured analysis with evidence references", () => {
    const analysis = analyzeIncident(sampleIncident);

    expect(analysis.severity).toBe("sev2");
    expect(analysis.timeline.length).toBeGreaterThanOrEqual(4);
    expect(analysis.rootCause.confidence).toBe("high");
    expect(analysis.rootCause.evidenceRefs).toContain("ev_logs_stripe_secret");
    expect(analysis.unknowns.length).toBeGreaterThan(0);
  });
});
