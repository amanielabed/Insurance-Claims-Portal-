import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

interface Part {
  name: string;
  aiEstimate: number;
  laborHours: number;
  flagged?: boolean;
}

interface Claim {
  id: string;
  type: string;
  delegationState: "FAST_TRACK" | "HUMAN_REVIEW";
  trustScore: number;
  riskLevel: "LOW" | "HIGH";
  estimatedCost: number;
  confidenceLabel: string;
  actionMessage: string;
  parts: Part[];
  imagePlaceholder: string;
}

const CLAIM_DATA: Record<string, Claim> = {
  "2026-001": {
    id: "2026-001",
    type: "Simple Scratch",
    delegationState: "FAST_TRACK",
    trustScore: 94,
    riskLevel: "LOW",
    estimatedCost: 187.5,
    confidenceLabel:
      "High confidence — clear imagery, single damaged part, no structural risk detected",
    actionMessage:
      "Fast-track eligible. AI can draft the estimate with minimal human review.",
    parts: [{ name: "Rear bumper cover repair", aiEstimate: 142.5, laborHours: 1.5 }],
    imagePlaceholder: "Simple bumper scratch",
  },
  "2026-002": {
    id: "2026-002",
    type: "Rear Collision",
    delegationState: "HUMAN_REVIEW",
    trustScore: 61,
    riskLevel: "HIGH",
    estimatedCost: 1240,
    confidenceLabel:
      "Moderate confidence — low resolution on rear quarter panel, possible hidden frame damage behind deformation",
    actionMessage:
      "Human review required. Payment is paused until adjuster validates flagged items.",
    parts: [
      { name: "Rear quarter panel skin", aiEstimate: 380, laborHours: 3.5 },
      { name: "Frame rail inspection", aiEstimate: 890, laborHours: 3.0, flagged: true },
    ],
    imagePlaceholder: "Rear collision damage",
  },
};

const CLAIM_OPTIONS = [
  { id: "2026-001", label: "Claim #2026-001 — Simple Scratch" },
  { id: "2026-002", label: "Claim #2026-002 — Rear Collision" },
];

function Index() {
  const [selectedClaimId, setSelectedClaimId] = useState(CLAIM_OPTIONS[0].id);
  const claim = CLAIM_DATA[selectedClaimId];

  return (
    <div
      className="flex flex-col h-screen"
      style={{ backgroundColor: "#F8FAFC", color: "#1F2937" }}
    >
      <header
        className="flex items-center justify-between px-6 h-14 border-b shrink-0"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-sm"
            style={{ backgroundColor: "#2563EB" }}
          />
          <h1 className="text-sm font-semibold tracking-tight" style={{ color: "#1F2937" }}>
            Claims Delegation Cockpit
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium" style={{ color: "#6B7280" }}>
            Active claim
          </label>
          <select
            value={selectedClaimId}
            onChange={(e) => setSelectedClaimId(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#1F2937",
              borderColor: "#D1D5DB",
            }}
          >
            {CLAIM_OPTIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="flex-1 min-h-0 grid grid-cols-3 gap-4 p-4">
        <Panel title="Damage Photo">
          <div className="flex flex-col h-full gap-3">
            <div
              className="flex items-center justify-center flex-1 rounded-md border border-dashed text-sm min-h-0"
              style={{
                backgroundColor: "#F1F5F9",
                borderColor: "#CBD5E1",
                color: "#64748B",
              }}
            >
              <div className="text-center px-4">
                <div className="mb-2 font-medium" style={{ color: "#475569" }}>
                  {claim.imagePlaceholder}
                </div>
                <div className="text-xs" style={{ color: "#94A3B8" }}>
                  Claim {claim.id}
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <StatusBadge state={claim.delegationState} />
            </div>
          </div>
        </Panel>

        <Panel title="AI Assessment">
          <div className="flex flex-col h-full gap-4">
            <div
              className="flex items-center justify-between rounded-md px-4 py-3"
              style={{
                backgroundColor:
                  claim.delegationState === "FAST_TRACK" ? "#F0FDF4" : "#FEF2F2",
              }}
            >
              <div>
                <div className="text-xs font-medium" style={{ color: "#6B7280" }}>
                  Trust Score
                </div>
                <div
                  className="text-2xl font-bold"
                  style={{
                    color:
                      claim.delegationState === "FAST_TRACK" ? "#16A34A" : "#DC2626",
                  }}
                >
                  {claim.trustScore}
                  <span className="text-sm font-normal" style={{ color: "#9CA3AF" }}>
                    /100
                  </span>
                </div>
              </div>
              <div
                className="px-3 py-1 rounded-md text-xs font-semibold"
                style={{
                  backgroundColor:
                    claim.riskLevel === "LOW" ? "#DCFCE7" : "#FEE2E2",
                  color: claim.riskLevel === "LOW" ? "#16A34A" : "#DC2626",
                }}
              >
                {claim.riskLevel} RISK
              </div>
            </div>

            <div className="flex-1 overflow-auto min-h-1">
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6B7280" }}>
                Confidence Assessment
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
                {claim.confidenceLabel}
              </p>

              <div className="mt-4 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6B7280" }}>
                AI Recommendation
              </div>
              <div
                className="rounded-md p-3 text-sm"
                style={{
                  backgroundColor:
                    claim.delegationState === "FAST_TRACK" ? "#EFF6FF" : "#FEF2F2",
                  color: claim.delegationState === "FAST_TRACK" ? "#1E40AF" : "#991B1B",
                }}
              >
                {claim.actionMessage}
              </div>
            </div>

            <div className="shrink-1 mt-auto">
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6B7280" }}>
                Delegation State
              </div>
              <div
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
                style={{
                  backgroundColor:
                    claim.delegationState === "FAST_TRACK" ? "#F0FDF4" : "#FEF2F2",
                  color:
                    claim.delegationState === "FAST_TRACK" ? "#16A34A" : "#DC2626",
                  border: `1px solid ${claim.delegationState === "FAST_TRACK" ? "#BBF7D0" : "#FECACA"}`,
                }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      claim.delegationState === "FAST_TRACK" ? "#16A34A" : "#DC2626",
                  }}
                />
                {claim.delegationState === "FAST_TRACK"
                  ? "Fast-Track Approved"
                  : "Human Review Required"}
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Estimatics Review">
          <div className="flex flex-col h-full gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6B7280" }}>
                Estimated Cost
              </div>
              <div className="text-2xl font-bold" style={{ color: "#1F2937" }}>
                ${claim.estimatedCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>

            <div className="flex-1 overflow-auto min-h-1">
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6B7280" }}>
                Line Items
              </div>
              <div className="flex flex-col gap-2">
                {claim.parts.map((part, i) => (
                  <div
                    key={i}
                    className="rounded-md border p-3"
                    style={{
                      backgroundColor: part.flagged ? "#FEF2F2" : "#FAFAFA",
                      borderColor: part.flagged ? "#FECACA" : "#E5E7EB",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: "#1F2937" }}>
                        {part.name}
                      </span>
                      {part.flagged && (
                        <span
                          className="px-2 py-0.5 rounded text-xs font-semibold"
                          style={{
                            backgroundColor: "#FEE2E2",
                            color: "#DC2626",
                          }}
                        >
                          FLAGGED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs" style={{ color: "#6B7280" }}>
                      <span>{part.laborHours} hrs labor</span>
                      <span className="font-medium" style={{ color: "#1F2937" }}>
                        ${part.aiEstimate.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {claim.delegationState === "HUMAN_REVIEW" && (
              <div
                className="shrink-1 rounded-md p-3 text-sm"
                style={{
                  backgroundColor: "#FEF2F2",
                  color: "#991B1B",
                  border: "1px solid #FECACA",
                }}
              >
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#DC2626" }}
                  />
                  Payment Paused
                </div>
                <div className="text-xs" style={{ color: "#B91C1C" }}>
                  Flagged items require adjuster validation before payment release.
                </div>
              </div>
            )}

            {claim.delegationState === "FAST_TRACK" && (
              <div
                className="shrink-1 rounded-md p-3 text-sm"
                style={{
                  backgroundColor: "#F0FDF4",
                  color: "#166534",
                  border: "1px solid #BBF7D0",
                }}
              >
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#16A34A" }}
                  />
                  Payment Ready
                </div>
                <div className="text-xs" style={{ color: "#15803D" }}>
                  AI-generated estimate is approved for fast-track disbursement.
                </div>
              </div>
            )}
          </div>
        </Panel>
      </main>
    </div>
  );
}

function StatusBadge({ state }: { state: "FAST_TRACK" | "HUMAN_REVIEW" }) {
  const isFastTrack = state === "FAST_TRACK";
  return (
    <div
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
      style={{
        backgroundColor: isFastTrack ? "#F0FDF4" : "#FEF2F2",
        color: isFastTrack ? "#16A34A" : "#DC2626",
        border: `1px solid ${isFastTrack ? "#BBF7D0" : "#FECACA"}`,
      }}
    >
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{
          backgroundColor: isFastTrack ? "#16A34A" : "#DC2626",
        }}
      />
      {isFastTrack ? "Fast-Track" : "Human Review"}
    </div>
  );
}

function Panel({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section
      className="flex flex-col min-h-0 rounded-lg border"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <header
        className="flex items-center justify-between px-4 h-11 border-b shrink-0"
        style={{ borderColor: "#E5E7EB" }}
      >
        <h2
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "#6B7280" }}
        >
          {title}
        </h2>
      </header>
      <div className="flex-1 min-h-0 p-4 overflow-auto">{children}</div>
    </section>
  );
}
