import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
  reviewConfidence: "High" | "Moderate" | "Low";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  estimatedCost: number;
  confidenceLabel: string;
  actionMessage: string;
  imagePlaceholder: string;
  parts: Part[];
  verificationConcerns?: string[];
  recommendedReviewer?: {
    title: string;
    description: string;
  };
}

const claimData: Claim[] = [
  {
    id: "2026-001",
    type: "Simple Scratch",
    delegationState: "FAST_TRACK",
    reviewConfidence: "High",
    riskLevel: "LOW",
    estimatedCost: 187.5,
    confidenceLabel: "Clear imagery, single damaged part, low repair complexity.",
    actionMessage:
      "Auto-route eligible. This claim can move through a lightweight confirmation flow.",
    imagePlaceholder: "Simple bumper scratch",
    parts: [
      {
        name: "Rear bumper cover repair",
        suggestedRepairScope: "Repair",
        draftEstimate: 187.5,
        laborHours: 1.5,
        flagged: false,
      },
    ],
  },
  {
    id: "2026-002",
    type: "Rear Collision",
    delegationState: "MANUAL_REVIEW",
    reviewConfidence: "Moderate",
    riskLevel: "HIGH",
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
    verificationConcerns: [
      "Low resolution detected on rear quarter panel",
      "Labor estimate range indicates possible structural uncertainty",
      "Frame damage cannot be verified from available angles",
    ],
    recommendedReviewer: {
      title: "Recommended Reviewer",
      description: "This claim may involve structural damage. Recommended reviewer: Structural damage specialist.",
    },
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

  const [seniorReview, setSeniorReview] = useState(false);

  // Reset escalation when switching claims
  useEffect(() => {
    setSeniorReview(false);
  }, [selectedId]);

  const isFastTrack = claim.delegationState === "FAST_TRACK";

  const workflowState: "FAST_TRACK" | "MANUAL_REVIEW" | "SENIOR_REVIEW" =
    seniorReview ? "SENIOR_REVIEW" : isFastTrack ? "FAST_TRACK" : "MANUAL_REVIEW";

  const workflowLabel = {
    FAST_TRACK: "Fast-Track",
    MANUAL_REVIEW: "Manual Review",
    SENIOR_REVIEW: "Senior Review",
  }[workflowState];

  const workflowStyles = {
    FAST_TRACK: { bar: COLORS.green, bg: COLORS.greenBg, fg: COLORS.greenText },
    MANUAL_REVIEW: { bar: COLORS.amber, bg: COLORS.amberBg, fg: COLORS.amberText },
    SENIOR_REVIEW: { bar: "#DC2626", bg: "#FEF2F2", fg: "#991B1B" },
  }[workflowState];

  return (
    <div
      className="flex flex-col h-screen"
      style={{ backgroundColor: COLORS.bg, color: COLORS.text }}
    >
      {/* Workflow status indicator bar */}
      <div
        key={workflowState}
        className="flex items-center gap-2 px-6 h-7 border-b shrink-0 transition-colors duration-300 animate-fade-in"
        style={{
          backgroundColor: workflowStyles.bg,
          borderColor: COLORS.border,
          color: workflowStyles.fg,
        }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: workflowStyles.bar }}
        />
        <span className="text-[11px] font-semibold uppercase tracking-wider">
          Workflow Status: {workflowLabel}
        </span>
      </div>

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

      {/* Escalation banner */}
      <div key={workflowState + "-banner"} className="animate-fade-in">
        {seniorReview ? (
          <div
            className="flex items-start gap-3 px-6 py-3 border-b shrink-0"
            style={{
              backgroundColor: "#FEF2F2",
              borderColor: "#FECACA",
              color: "#991B1B",
            }}
          >
            <span className="text-base leading-5">●</span>
            <div>
              <div className="text-sm font-semibold">Senior Review Required</div>
              <div className="text-xs mt-0.5" style={{ color: "#B91C1C" }}>
                This claim requires authorization before submission.
              </div>
            </div>
          </div>
        ) : (
          !isFastTrack && (
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
          )
        )}
      </div>

      <main
        key={claim.id + workflowState}
        className="flex-1 min-h-0 grid grid-cols-3 gap-4 p-4 animate-fade-in"
      >
        {/* Damage Photo */}
        <Panel title="Damage Photo">
          <DamagePhotoPanel claim={claim} />
        </Panel>

        {/* Center: Assessment Review */}
        <Panel title="Assessment Review">
          <AssessmentReviewPanel claim={claim} />
        </Panel>

        {/* Right: Estimate Review */}
        <Panel title="Estimate Review">
          <EstimateReviewPanel
            key={claim.id}
            claim={claim}
            isFastTrack={isFastTrack}
            seniorReview={seniorReview}
            onTriggerSeniorReview={() => setSeniorReview(true)}
          />
        </Panel>
      </main>

      <DemoGuide />
    </div>
  );
}

function DemoGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div
          className="w-72 rounded-lg border shadow-lg animate-fade-in"
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        >
          <div
            className="flex items-center justify-between px-3 h-9 border-b"
            style={{ borderColor: COLORS.border }}
          >
            <span
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: COLORS.muted }}
            >
              Demo Guide
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-xs"
              style={{ color: COLORS.muted }}
              aria-label="Close demo guide"
            >
              ✕
            </button>
          </div>
          <ol className="px-4 py-3 flex flex-col gap-2 text-xs" style={{ color: COLORS.text }}>
            <li className="flex gap-2">
              <span className="font-semibold" style={{ color: COLORS.muted }}>1.</span>
              <span>Select Claim 001 to demonstrate Fast-Track processing.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold" style={{ color: COLORS.muted }}>2.</span>
              <span>Select Claim 002 to demonstrate Manual Review workflow.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold" style={{ color: COLORS.muted }}>3.</span>
              <span>
                Edit a high-risk estimate significantly or click “Flag for Senior Review”
                to demonstrate escalation handling.
              </span>
            </li>
          </ol>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full shadow-md border px-3 py-2 text-xs font-medium transition-colors"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
            color: COLORS.text,
          }}
        >
          Demo Guide
        </button>
      )}
    </div>
  );
}

function AssessmentReviewPanel({ claim }: { claim: Claim }) {
  const isFastTrack = claim.delegationState === "FAST_TRACK";

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Delegation Status Badge */}
      {isFastTrack ? (
        <div
          className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold self-start"
          style={{
            backgroundColor: COLORS.greenBg,
            color: COLORS.greenText,
            border: "1px solid #BBF7D0",
          }}
        >
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.green }} />
          Fast-Track Eligible
        </div>
      ) : (
        <div
          className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold self-start"
          style={{
            backgroundColor: COLORS.amberBg,
            color: COLORS.amberText,
            border: `1px solid ${COLORS.amberBorder}`,
          }}
        >
          <span className="text-sm leading-none">⚠</span>
          Manual Review Required
        </div>
      )}

      {/* Review Confidence Card */}
      <div
        className="rounded-md border p-4"
        style={{
          backgroundColor: isFastTrack ? COLORS.greenBg : "#FAFAFA",
          borderColor: isFastTrack ? "#BBF7D0" : COLORS.border,
        }}
      >
        <Label>Review Confidence</Label>
        <p className="text-sm leading-relaxed mt-2" style={{ color: "#374151" }}>
          {claim.confidenceLabel}
        </p>

        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${isFastTrack ? "#BBF7D0" : COLORS.border}` }}>
          {isFastTrack ? (
            <p className="text-sm" style={{ color: COLORS.muted }}>
              No additional review triggers detected.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium" style={{ color: COLORS.amberText }}>
                Verification concerns:
              </p>
              {claim.verificationConcerns?.map((concern, i) => (
                <div key={i} className="flex items-start gap-2 text-sm" style={{ color: "#374151" }}>
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: COLORS.amber }} />
                  {concern}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Reviewer — MANUAL_REVIEW only */}
      {!isFastTrack && claim.recommendedReviewer && (
        <div
          className="rounded-md border p-4"
          style={{
            backgroundColor: COLORS.amberBg,
            borderColor: COLORS.amberBorder,
          }}
        >
          <div className="text-sm font-semibold" style={{ color: COLORS.amberText }}>
            {claim.recommendedReviewer.title}
          </div>
          <p className="text-sm mt-1" style={{ color: "#92400E" }}>
            {claim.recommendedReviewer.description}
          </p>
        </div>
      )}
    </div>
  );
}

function DamagePhotoPanel({ claim }: { claim: Claim }) {
  const confidence = claim.reviewConfidence;

  const confidenceMeta: Record<
    Claim["reviewConfidence"],
    { color: string; bg: string; fill: string; width: string }
  > = {
    High: { color: COLORS.green, bg: COLORS.greenBg, fill: COLORS.green, width: "92%" },
    Moderate: { color: COLORS.amber, bg: COLORS.amberBg, fill: COLORS.amber, width: "58%" },
    Low: { color: "#DC2626", bg: "#FEF2F2", fill: "#DC2626", width: "32%" },
  };
  const c = confidenceMeta[confidence];

  const riskMap: Record<
    Claim["riskLevel"],
    { bg: string; fg: string; border: string; dot: string }
  > = {
    LOW: { bg: COLORS.greenBg, fg: COLORS.greenText, border: "#BBF7D0", dot: COLORS.green },
    MEDIUM: { bg: COLORS.amberBg, fg: COLORS.amberText, border: COLORS.amberBorder, dot: COLORS.amber },
    HIGH: { bg: "#FEF2F2", fg: "#B91C1C", border: "#FECACA", dot: "#DC2626" },
  };
  const risk = riskMap[claim.riskLevel];

  const isFastTrack = claim.delegationState === "FAST_TRACK";

  return (
    <div className="flex flex-col h-full gap-5">
      {/* Image area */}
      <div
        className="relative flex items-center justify-center flex-1 rounded-md min-h-0 overflow-hidden"
        style={{ backgroundColor: "#E5E7EB", border: `1px solid ${COLORS.border}` }}
      >
        <div className="text-center px-4">
          <div className="font-medium text-sm" style={{ color: "#475569" }}>
            {claim.imagePlaceholder}
          </div>
          <div className="text-xs mt-1" style={{ color: "#94A3B8" }}>
            Claim {claim.id}
          </div>
        </div>

        {isFastTrack ? (
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-4 rounded-sm px-2.5 py-1 text-[11px] font-medium"
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.10)",
              border: "1px solid rgba(34, 197, 94, 0.35)",
              color: COLORS.greenText,
            }}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: COLORS.green }} />
            Bumper Cover
          </div>
        ) : (
          <div
            className="absolute top-3 right-3 min-w-[140px] max-w-[45%] rounded-sm px-3 py-2"
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.10)",
              border: "1px solid rgba(245, 158, 11, 0.35)",
            }}
          >
            <div className="text-[11px] font-semibold" style={{ color: COLORS.amberText }}>
              ⚠ Verification Required
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: "#92400E" }}>
              Possible structural damage detected.
            </div>
          </div>
        )}
      </div>

      {/* Review Confidence */}
      <div className="shrink-1 space-y-1.5">
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: COLORS.muted }}
          >
            Review Confidence
          </span>
          <span className="text-sm font-medium" style={{ color: c.color }}>
            {confidence}
          </span>
        </div>
        <div
          className="h-1.5 w-full rounded-full overflow-hidden"
          style={{ backgroundColor: c.bg }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: c.width, backgroundColor: c.fill }}
          />
        </div>
      </div>

      {/* Risk Level */}
      <div className="shrink-0 flex items-center justify-between">
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: COLORS.muted }}
        >
          Risk Level
        </span>
        <div
          className="inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-semibold"
          style={{
            backgroundColor: risk.bg,
            color: risk.fg,
            border: `1px solid ${risk.border}`,
          }}
        >
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: risk.dot }}
          />
          {claim.riskLevel}
        </div>
      </div>
    </div>
  );
}

interface LogEntry {
  id: number;
  partName: string;
  from: number;
  to: number;
}

function EstimateReviewPanel({
  claim,
  isFastTrack,
  seniorReview,
  onTriggerSeniorReview,
}: {
  claim: Claim;
  isFastTrack: boolean;
  seniorReview: boolean;
  onTriggerSeniorReview: () => void;
}) {
  const [adjusted, setAdjusted] = useState<number[]>(() =>
    claim.parts.map((p) => p.draftEstimate),
  );
  const [drafts, setDrafts] = useState<string[]>(() =>
    claim.parts.map((p) => p.draftEstimate.toFixed(2)),
  );
  const [log, setLog] = useState<LogEntry[]>([]);
  const [checks, setChecks] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const allChecked = checks.every(Boolean);
  const toggle = (i: number) =>
    setChecks((prev) => {
      const next = [...prev] as [boolean, boolean, boolean];
      next[i] = !next[i];
      return next;
    });

  // Auto-escalate: variance >15% on any high-risk (flagged) line item
  useEffect(() => {
    if (seniorReview) return;
    const triggered = claim.parts.some((part, i) => {
      if (!part.flagged) return false;
      const draft = part.draftEstimate;
      if (draft === 0) return false;
      return Math.abs(adjusted[i] - draft) / draft > 0.15;
    });
    if (triggered) onTriggerSeniorReview();
  }, [adjusted, claim.parts, seniorReview, onTriggerSeniorReview]);





  const draftTotal = claim.parts.reduce((s, p) => s + p.draftEstimate, 0);
  const adjustedTotal = adjusted.reduce((s, n) => s + (isFinite(n) ? n : 0), 0);

  const commitEdit = (i: number, raw: string) => {
    const parsed = parseFloat(raw);
    if (isNaN(parsed)) {
      setDrafts((prev) => {
        const n = [...prev];
        n[i] = adjusted[i].toFixed(2);
        return n;
      });
      return;
    }
    const prevVal = adjusted[i];
    if (parsed === prevVal) return;
    setAdjusted((prev) => {
      const n = [...prev];
      n[i] = parsed;
      return n;
    });
    setDrafts((prev) => {
      const n = [...prev];
      n[i] = parsed.toFixed(2);
      return n;
    });
    setLog((prev) =>
      [
        { id: Date.now(), partName: claim.parts[i].name, from: prevVal, to: parsed },
        ...prev,
      ].slice(0, 4),
    );
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Estimate table */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <th
                className="text-left font-semibold uppercase tracking-wider text-[10px] pb-2 pr-2"
                style={{ color: COLORS.muted }}
              >
                Line Item
              </th>
              <th
                className="text-right font-semibold uppercase tracking-wider text-[10px] pb-2 px-2"
                style={{ color: COLORS.muted }}
              >
                Draft
              </th>
              <th
                className="text-right font-semibold uppercase tracking-wider text-[10px] pb-2 px-2"
                style={{ color: COLORS.muted }}
              >
                Adjusted
              </th>
              <th
                className="text-right font-semibold uppercase tracking-wider text-[10px] pb-2 pl-2"
                style={{ color: COLORS.muted }}
              >
                Difference
              </th>
            </tr>
          </thead>
          <tbody>
            {claim.parts.map((part, i) => {
              const draft = part.draftEstimate;
              const adj = adjusted[i];
              const diff = adj - draft;
              const pct = draft === 0 ? 0 : Math.abs(diff / draft);
              const variance = pct > 0.15;
              const diffColor =
                diff === 0
                  ? COLORS.muted
                  : diff > 0
                    ? COLORS.amberText
                    : COLORS.greenText;
              const sign = diff > 0 ? "+" : diff < 0 ? "−" : "";
              return (
                <tr
                  key={i}
                  style={{
                    backgroundColor: variance ? COLORS.amberBg : "transparent",
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  <td className="py-2.5 pr-2 align-top">
                    <div className="font-medium" style={{ color: COLORS.text }}>
                      {part.name}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: COLORS.muted }}>
                      {part.suggestedRepairScope} · {part.laborHours} hrs
                    </div>
                  </td>
                  <td
                    className="py-2.5 px-2 text-right align-top tabular-nums"
                    style={{ color: COLORS.muted }}
                  >
                    {fmtCurrency(draft)}
                  </td>
                  <td className="py-2.5 px-2 text-right align-top">
                    <input
                      type="number"
                      step="0.01"
                      value={drafts[i]}
                      onChange={(e) =>
                        setDrafts((prev) => {
                          const n = [...prev];
                          n[i] = e.target.value;
                          return n;
                        })
                      }
                      onBlur={(e) => commitEdit(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      }}
                      className="w-24 text-right tabular-nums rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        borderColor: "#D1D5DB",
                        backgroundColor: COLORS.surface,
                        color: COLORS.text,
                      }}
                    />
                  </td>
                  <td
                    className="py-2.5 pl-2 text-right align-top tabular-nums font-medium"
                    style={{ color: diffColor }}
                  >
                    {diff === 0
                      ? "—"
                      : `${sign}${fmtCurrency(Math.abs(diff))}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="shrink-0 flex flex-col gap-1 pt-2 border-t" style={{ borderColor: COLORS.border }}>
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: COLORS.muted }}>Draft Total</span>
          <span className="tabular-nums" style={{ color: COLORS.muted }}>
            {fmtCurrency(draftTotal)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
            Adjusted Total
          </span>
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color: COLORS.text }}
          >
            {fmtCurrency(adjustedTotal)}
          </span>
        </div>
      </div>

      {/* Activity log */}
      {log.length > 0 && (
        <div
          className="shrink-0 rounded-md border px-3 py-2"
          style={{ backgroundColor: "#FAFAFA", borderColor: COLORS.border }}
        >
          <Label>Activity</Label>
          <ul className="mt-1.5 flex flex-col gap-1">
            {log.map((entry) => (
              <li
                key={entry.id}
                className="text-xs"
                style={{ color: COLORS.muted }}
              >
                Estimate updated: {entry.partName}{" "}
                <span style={{ color: COLORS.text }}>
                  {fmtCurrency(entry.from)} → {fmtCurrency(entry.to)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      {seniorReview ? (
        <div className="shrink-0 flex flex-col gap-3">
          <div
            className="rounded-md border px-3 py-2.5"
            style={{
              backgroundColor: "#FEF2F2",
              borderColor: "#FECACA",
            }}
          >
            <div className="text-sm font-semibold" style={{ color: "#991B1B" }}>
              Significant estimate variance detected.
            </div>
            <div className="text-xs mt-1" style={{ color: "#B91C1C" }}>
              Final approval must be completed by an authorized senior adjuster.
            </div>
          </div>
          <button
            disabled
            className="w-full rounded-md py-2.5 text-sm font-semibold cursor-not-allowed"
            style={{
              backgroundColor: "#F3F4F6",
              color: "#9CA3AF",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            {isFastTrack ? "Confirm Estimate" : "Submit for Authorization"}
          </button>
          <button
            onClick={() =>
              toast("Senior adjuster notified. Claim queued for review.")
            }
            className="w-full rounded-md py-2.5 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: "#DC2626" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B91C1C")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#DC2626")}
          >
            Request Senior Review
          </button>
        </div>
      ) : isFastTrack ? (
        <div className="shrink-0 flex flex-col gap-2">
          <button
            onClick={() =>
              toast.success(`Claim #${claim.id} approved and routed for processing`, {
                description: "Estimated handling time: 23 seconds",
              })
            }
            className="w-full rounded-md py-2.5 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: COLORS.blue }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.blueHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.blue)}
          >
            Confirm Estimate
          </button>
          <button
            onClick={onTriggerSeniorReview}
            className="text-xs font-medium underline-offset-2 hover:underline self-center"
            style={{ color: COLORS.muted }}
          >
            Flag for Senior Review
          </button>
        </div>
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
          <button
            onClick={onTriggerSeniorReview}
            className="text-xs font-medium underline-offset-2 hover:underline self-center mt-1"
            style={{ color: COLORS.muted }}
          >
            Flag for Senior Review
          </button>
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
