import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

interface Part {
  name: string;
  suggestedRepairScope: string;
  draftEstimate: number;
  laborHours: number;
  flagged: boolean;
}

interface Claim {
  id: string;
  type: string;
  delegationState: "FAST_TRACK" | "MANUAL_REVIEW";
  visionState: "GHOST" | "CHALLENGE";
  reviewConfidence: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  trustScore: number;
  estimatedCost: number;
  confidenceLabel: string;
  actionMessage: string;
  imagePlaceholder: string;
  parts: Part[];
}

const claimData: Claim[] = [
  {
    id: "2026-001",
    type: "Simple Scratch",
    delegationState: "FAST_TRACK",
    visionState: "GHOST",
    reviewConfidence: "High",
    riskLevel: "LOW",
    trustScore: 94,
    estimatedCost: 187.5,
    confidenceLabel: "Clear imagery, single damaged part, low repair complexity.",
    actionMessage:
      "Auto-route eligible. This claim can move through a lightweight confirmation flow.",
    imagePlaceholder: "Simple bumper scratch",
    parts: [
      {
        name: "Rear bumper cover repair",
        suggestedRepairScope: "Repair",
        draftEstimate: 142.5,
        laborHours: 1.5,
        flagged: false,
      },
    ],
  },
  {
    id: "2026-002",
    type: "Rear Collision",
    delegationState: "MANUAL_REVIEW",
    visionState: "CHALLENGE",
    reviewConfidence: "Moderate",
    riskLevel: "HIGH",
    trustScore: 61,
    estimatedCost: 1240,
    confidenceLabel:
      "Low resolution on rear quarter panel. Possible hidden structural damage behind deformation.",
    actionMessage:
      "Manual review required. Payment should remain paused until verification is complete.",
    imagePlaceholder: "Rear collision damage",
    parts: [
      {
        name: "Rear quarter panel skin",
        suggestedRepairScope: "Repair",
        draftEstimate: 380,
        laborHours: 3.5,
        flagged: false,
      },
      {
        name: "Frame rail inspection",
        suggestedRepairScope: "Inspect",
        draftEstimate: 890,
        laborHours: 3.0,
        flagged: true,
      },
    ],
  },
];

const COLORS = {
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  text: "#1F2937",
  muted: "#6B7280",
  blue: "#2563EB",
  blueHover: "#1D4ED8",
  green: "#22C55E",
  greenBg: "#F0FDF4",
  greenText: "#15803D",
  amber: "#F59E0B",
  amberBg: "#FFFBEB",
  amberBorder: "#FDE68A",
  amberText: "#B45309",
};

const fmtCurrency = (n: number) =>
  `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Index() {
  const [selectedId, setSelectedId] = useState(claimData[0].id);
  const claim = useMemo(
    () => claimData.find((c) => c.id === selectedId) ?? claimData[0],
    [selectedId],
  );

  const isFastTrack = claim.delegationState === "FAST_TRACK";

  return (
    <div
      className="flex flex-col h-screen"
      style={{ backgroundColor: COLORS.bg, color: COLORS.text }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 h-14 border-b shrink-0"
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-sm"
            style={{ backgroundColor: COLORS.blue }}
          />
          <h1 className="text-sm font-semibold tracking-tight">
            Claims Delegation Cockpit
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium" style={{ color: COLORS.muted }}>
            Active claim
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: COLORS.surface,
              color: COLORS.text,
              borderColor: "#D1D5DB",
            }}
          >
            {claimData.map((c) => (
              <option key={c.id} value={c.id}>
                Claim #{c.id} — {c.type}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Manual review banner */}
      {!isFastTrack && (
        <div
          className="flex items-start gap-3 px-6 py-3 border-b shrink-0"
          style={{
            backgroundColor: COLORS.amberBg,
            borderColor: COLORS.amberBorder,
            color: COLORS.amberText,
          }}
        >
          <span className="text-base leading-5">⚠</span>
          <div>
            <div className="text-sm font-semibold">Manual Review Required</div>
            <div className="text-xs mt-0.5" style={{ color: "#92400E" }}>
              Possible structural damage detected. Please verify before approval.
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 min-h-0 grid grid-cols-3 gap-4 p-4">
        {/* Damage Photo */}
        <Panel title="Damage Photo">
          <div className="flex flex-col h-full gap-3">
            <div
              className="flex items-center justify-center flex-1 rounded-md border-2 text-sm min-h-0"
              style={{
                backgroundColor: "#F1F5F9",
                borderColor: isFastTrack
                  ? "rgba(34,197,94,0.4)"
                  : COLORS.amber,
                borderStyle: isFastTrack ? "dashed" : "solid",
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
            {!isFastTrack && (
              <div
                className="text-xs px-3 py-2 rounded-md"
                style={{
                  backgroundColor: COLORS.amberBg,
                  color: COLORS.amberText,
                  border: `1px solid ${COLORS.amberBorder}`,
                }}
              >
                Review image carefully — structural damage possible
              </div>
            )}
            <div className="shrink-0">
              {isFastTrack ? (
                <Badge
                  dot={COLORS.green}
                  bg={COLORS.greenBg}
                  fg={COLORS.greenText}
                  border="#BBF7D0"
                  text="Auto-Route Eligible"
                />
              ) : (
                <Badge
                  dot={COLORS.amber}
                  bg={COLORS.amberBg}
                  fg={COLORS.amberText}
                  border={COLORS.amberBorder}
                  text="Verification Required"
                />
              )}
            </div>
          </div>
        </Panel>

        {/* Center: Initial Assessment / Review Confidence */}
        <Panel title={isFastTrack ? "Initial Assessment" : "Review Confidence"}>
          <div className="flex flex-col h-full gap-4">
            <div>
              <Label>{isFastTrack ? "High review confidence" : "Review confidence"}</Label>
              <div
                className="text-sm font-semibold mt-1"
                style={{
                  color: isFastTrack ? COLORS.greenText : COLORS.amberText,
                }}
              >
                {claim.reviewConfidence} · {claim.riskLevel} risk
              </div>
              {isFastTrack && (
                <div className="text-xs mt-1" style={{ color: COLORS.muted }}>
                  Clear imagery and low repair complexity
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto min-h-0">
              <Label>Initial Assessment</Label>
              <p className="text-sm leading-relaxed mt-1" style={{ color: "#374151" }}>
                {claim.confidenceLabel}
              </p>

              <div className="mt-4">
                <Label>Next Action</Label>
                <div
                  className="rounded-md p-3 text-sm mt-1"
                  style={{
                    backgroundColor: isFastTrack ? "#EFF6FF" : COLORS.amberBg,
                    color: isFastTrack ? "#1E40AF" : COLORS.amberText,
                    border: `1px solid ${isFastTrack ? "#BFDBFE" : COLORS.amberBorder}`,
                  }}
                >
                  {claim.actionMessage}
                </div>
              </div>
            </div>
          </div>
        </Panel>

        {/* Right: Estimatics Review */}
        <Panel title="Estimatics Review">
          <EstimaticsPanel claim={claim} isFastTrack={isFastTrack} />
        </Panel>
      </main>
    </div>
  );
}

function EstimaticsPanel({ claim, isFastTrack }: { claim: Claim; isFastTrack: boolean }) {
  const [checks, setChecks] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const allChecked = checks.every(Boolean);
  const toggle = (i: number) =>
    setChecks((prev) => {
      const next = [...prev] as [boolean, boolean, boolean];
      next[i] = !next[i];
      return next;
    });

  return (
    <div className="flex flex-col h-full gap-4">
      <div>
        <Label>Draft Estimate</Label>
        <div className="text-2xl font-bold mt-1" style={{ color: COLORS.text }}>
          {fmtCurrency(claim.estimatedCost)}
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        <Label>Line Items</Label>
        <div className="flex flex-col gap-2 mt-2">
          {claim.parts.map((part, i) => {
            const flagged = part.flagged;
            return (
              <div
                key={i}
                className="rounded-md border p-3"
                style={{
                  backgroundColor: flagged ? COLORS.amberBg : "#FAFAFA",
                  borderColor: flagged ? COLORS.amberBorder : COLORS.border,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: COLORS.text }}>
                    {part.name}
                  </span>
                  {flagged && (
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: "#FEF3C7",
                        color: COLORS.amberText,
                      }}
                    >
                      NEEDS VERIFICATION
                    </span>
                  )}
                </div>
                <div
                  className="flex items-center justify-between mt-2 text-xs"
                  style={{ color: COLORS.muted }}
                >
                  <span>
                    Suggested scope:{" "}
                    <span style={{ color: COLORS.text, fontWeight: 500 }}>
                      {part.suggestedRepairScope}
                    </span>
                    {" · "}
                    {part.laborHours} hrs
                  </span>
                  <span className="font-medium" style={{ color: COLORS.text }}>
                    {fmtCurrency(part.draftEstimate)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isFastTrack ? (
        <button
          className="shrink-0 w-full rounded-md py-2.5 text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: COLORS.blue }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.blueHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.blue)}
        >
          Confirm Draft Estimate
        </button>
      ) : (
        <div className="shrink-0 flex flex-col gap-2">
          <Label>Required Verification Before Submission</Label>
          <div className="flex flex-col gap-1.5 mt-1">
            {[
              "Confirm photo angle is sufficient",
              "Verify structural damage scope",
              "Check repair vs. replace decision",
            ].map((item, i) => (
              <label
                key={i}
                className="flex items-center gap-2 text-sm cursor-pointer select-none"
                style={{ color: COLORS.text }}
              >
                <input
                  type="checkbox"
                  checked={checks[i]}
                  onChange={() => toggle(i)}
                  className="w-4 h-4"
                  style={{ accentColor: COLORS.blue }}
                />
                {item}
              </label>
            ))}
          </div>
          {allChecked && (
            <button
              className="mt-2 w-full rounded-md py-2.5 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: COLORS.blue }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = COLORS.blueHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = COLORS.blue)
              }
            >
              Submit for Authorization
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Badge({
  dot,
  bg,
  fg,
  border,
  text,
}: {
  dot: string;
  bg: string;
  fg: string;
  border: string;
  text: string;
}) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold"
      style={{ backgroundColor: bg, color: fg, border: `1px solid ${border}` }}
    >
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{ backgroundColor: dot }}
      />
      {text}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-xs font-semibold uppercase tracking-wider"
      style={{ color: COLORS.muted }}
    >
      {children}
    </div>
  );
}

function Panel({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section
      className="flex flex-col min-h-0 rounded-lg border"
      style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
    >
      <header
        className="flex items-center justify-between px-4 h-11 border-b shrink-0"
        style={{ borderColor: COLORS.border }}
      >
        <h2
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: COLORS.muted }}
        >
          {title}
        </h2>
      </header>
      <div className="flex-1 min-h-0 p-4 overflow-auto">{children}</div>
    </section>
  );
}
