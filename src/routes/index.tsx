import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Check, CheckCircle, Clock, FileText, ChevronRight } from "lucide-react";
import claimSimpleImage from "@/assets/claim-simple.jpg";
import claimComplexImage from "@/assets/claim-complex.jpg";


export const Route = createFileRoute("/")({
  component: Index,
});

type SourceKey = "mitchell" | "ccc" | "oem" | "verify";

interface Part {
  name: string;
  suggestedRepairScope: string;
  draftEstimate: number;
  laborHours: number;
  partsPrice: number;
  flagged: boolean;
  sources: SourceKey[];
}


interface Claim {
  id: string;
  type: string;
  delegationState: "FAST_TRACK" | "VERIFICATION_RECOMMENDED" | "SENIOR_AUTHORIZATION";
  reviewConfidence: "High" | "Moderate" | "Low";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  estimatedCost: number;
  estimatedCostLabel?: string;
  confidenceLabel: string;
  actionMessage: string;
  imagePlaceholder: string;
  imageUrl?: string;
  parts: Part[];
  verificationConcerns?: string[];
  recommendedReviewer?: {
    title: string;
    description: string;
  };
}

interface ScenarioMeta {
  id: string;
  label: string;
  description: string;
  subtext?: string;
  state: "FAST_TRACK" | "VERIFICATION_RECOMMENDED" | "SENIOR_AUTHORIZATION";
  coverage: "full";
  fault: "policyholder" | "other";
  coverageLabel: string;
  faultLabel: string;
  deductibleLabel: string;
  deductibleValue: string;
  estimateRange: string;
}

const SCENARIOS: ScenarioMeta[] = [
  {
    id: "2026-001",
    label: "Fast-Track Approval (Demo)",
    description:
      "Full Coverage — minor cosmetic damage, direct agent approval.",
    state: "FAST_TRACK",
    coverage: "full",
    fault: "other",
    coverageLabel: "Full Coverage Policy",
    faultLabel: "Other party at fault",
    deductibleLabel: "N/A — liability handled by at-fault party",
    deductibleValue: "",
    estimateRange: "$329.50",
  },
  {
    id: "2026-002",
    label: "Verification Required (Demo)",
    description:
      "Full Coverage — moderate collision damage, additional review recommended.",
    state: "VERIFICATION_RECOMMENDED",
    coverage: "full",
    fault: "policyholder",
    coverageLabel: "Full Coverage Policy",
    faultLabel: "Policyholder at fault",
    deductibleLabel: "$500 (retrieved from policy record)",
    deductibleValue: "500",
    estimateRange: "$1,240",
  },
  {
    id: "2026-003",
    label: "Senior Authorization Required (Demo)",
    description:
      "Full Coverage — major structural collision, senior sign-off required.",
    subtext: "Authorization pending senior approval.",
    state: "SENIOR_AUTHORIZATION",
    coverage: "full",
    fault: "policyholder",
    coverageLabel: "Full Coverage Policy",
    faultLabel: "Policyholder at fault",
    deductibleLabel: "$500 (retrieved from policy record)",
    deductibleValue: "500",
    estimateRange: "$8,400+",
  },
];

const STATE_DOT: Record<ScenarioMeta["state"], string> = {
  FAST_TRACK: "#22C55E",
  VERIFICATION_RECOMMENDED: "#F59E0B",
  SENIOR_AUTHORIZATION: "#DC2626",
};

const claimData: Claim[] = [
  {
    id: "2026-001",
    type: "Simple Scratch",
    delegationState: "FAST_TRACK",
    reviewConfidence: "High",
    riskLevel: "LOW",
    estimatedCost: 329.5,
    confidenceLabel: "Clear imagery, single damaged part, low repair complexity.",
    actionMessage:
      "Auto-route eligible. This claim can move through a lightweight confirmation flow.",
    imagePlaceholder: "Simple bumper scratch",
    imageUrl: claimSimpleImage,
    parts: [
      {
        name: "Rear bumper cover repair",
        suggestedRepairScope: "Repair",
        draftEstimate: 329.5,
        laborHours: 1.5,
        partsPrice: 187.0,
        flagged: false,
        sources: ["mitchell", "ccc", "oem"],
      },

    ],
  },
  {
    id: "2026-002",
    type: "Rear Collision",
    delegationState: "VERIFICATION_RECOMMENDED",
    reviewConfidence: "Moderate",
    riskLevel: "HIGH",
    estimatedCost: 1240,
    estimatedCostLabel: "$1,240–$2,100",
    confidenceLabel:
      "Low resolution on rear quarter panel. Possible hidden structural damage behind deformation.",
    actionMessage:
      "Verification recommended. Payment should remain paused until verification is complete.",
    imagePlaceholder: "Rear collision damage",
    imageUrl: claimComplexImage,
    parts: [
      {
        name: "Rear quarter panel skin",
        suggestedRepairScope: "Repair",
        draftEstimate: 380,
        laborHours: 3.5,
        partsPrice: 47.5,
        flagged: false,
        sources: ["mitchell", "ccc"],
      },
      {
        name: "Frame rail inspection",
        suggestedRepairScope: "Inspect",
        draftEstimate: 860,
        laborHours: 3.0,
        partsPrice: 575,
        flagged: true,
        sources: ["oem", "verify"],
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
  {
    id: "2026-003",
    type: "Multi-Panel Structural",
    delegationState: "SENIOR_AUTHORIZATION",
    reviewConfidence: "Low",
    riskLevel: "HIGH",
    estimatedCost: 8400,
    estimatedCostLabel: "$8,400+",
    confidenceLabel:
      "Multi-panel impact with possible frame involvement. High estimated repair value exceeds standard approval threshold.",
    actionMessage:
      "Senior authorization required. This claim must be reviewed by a senior adjuster before authorization.",
    imagePlaceholder: "Multi-panel structural damage",
    imageUrl: claimComplexImage,
    parts: [
      {
        name: "Front bumper assembly",
        suggestedRepairScope: "Replace",
        draftEstimate: 1450,
        laborHours: 4.0,
        partsPrice: 1070,
        flagged: false,
        sources: ["mitchell", "oem"],
      },
      {
        name: "Driver-side fender",
        suggestedRepairScope: "Replace",
        draftEstimate: 1280,
        laborHours: 5.5,
        partsPrice: 757.5,
        flagged: false,
        sources: ["mitchell", "ccc"],
      },
      {
        name: "Hood panel",
        suggestedRepairScope: "Replace",
        draftEstimate: 1620,
        laborHours: 3.5,
        partsPrice: 1287.5,
        flagged: false,
        sources: ["mitchell", "oem"],
      },
      {
        name: "Front frame rail repair",
        suggestedRepairScope: "Inspect & Repair",
        draftEstimate: 2800,
        laborHours: 8.0,
        partsPrice: 2040,
        flagged: true,
        sources: ["oem", "verify"],
      },
      {
        name: "Radiator support",
        suggestedRepairScope: "Replace",
        draftEstimate: 1250,
        laborHours: 4.5,
        partsPrice: 822.5,
        flagged: true,
        sources: ["oem", "verify"],
      },
    ],
    verificationConcerns: [
      "Multi-panel impact suggests possible frame involvement",
      "Estimated repair value exceeds standard adjuster approval threshold",
      "Structural integrity cannot be confirmed from photo evidence alone",
    ],
    recommendedReviewer: {
      title: "Recommended Reviewer",
      description:
        "High-value structural claim. Recommended reviewer: Senior adjuster with structural authority.",
    },
  },
];

type OverlaySeverity = "green" | "amber" | "red";

interface DamageOverlay {
  partIndex: number;
  label: string;
  sub: string;
  severity: OverlaySeverity;
  dashed?: boolean;
  /** % of image dimensions */
  x: number;
  y: number;
  w: number;
  h: number;
}

const OVERLAY_COLORS: Record<OverlaySeverity, { fill: string; border: string; pillBg: string; pillFg: string }> = {
  green: {
    fill: "rgba(34, 197, 94, 0.15)",
    border: "#16A34A",
    pillBg: "#DCFCE7",
    pillFg: "#15803D",
  },
  amber: {
    fill: "rgba(245, 158, 11, 0.15)",
    border: "#D97706",
    pillBg: "#FEF3C7",
    pillFg: "#B45309",
  },
  red: {
    fill: "rgba(220, 38, 38, 0.15)",
    border: "#DC2626",
    pillBg: "#FEE2E2",
    pillFg: "#B91C1C",
  },
};

const OVERLAYS: Record<string, DamageOverlay[]> = {
  "2026-001": [
    {
      partIndex: 0,
      label: "Rear Bumper Cover",
      sub: "Cosmetic damage — repair recommended",
      severity: "green",
      x: 36, y: 60, w: 30, h: 22,
    },
  ],
  "2026-002": [
    {
      partIndex: 0,
      label: "Rear Quarter Panel",
      sub: "Damage extent requires verification",
      severity: "amber",
      x: 52, y: 26, w: 36, h: 40,
    },
    {
      partIndex: 1,
      label: "Frame Rail Area",
      sub: "Structural impact cannot be confirmed from available images",
      severity: "red",
      dashed: true,
      x: 48, y: 62, w: 26, h: 22,
    },
  ],
  "2026-003": [
    {
      partIndex: 1,
      label: "Driver Door",
      sub: "Severe deformation detected",
      severity: "red",
      x: 8, y: 32, w: 30, h: 40,
    },
    {
      partIndex: 3,
      label: "Rocker Panel",
      sub: "Possible frame involvement",
      severity: "red",
      x: 34, y: 72, w: 38, h: 14,
    },
    {
      partIndex: 4,
      label: "A-Pillar",
      sub: "Inspection required before authorization",
      severity: "amber",
      x: 6, y: 8, w: 18, h: 28,
    },
  ],
};


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

const STEPS = [
  "Submit Claim",
  "Upload Photos",
  "Claim Submitted",
  "Draft Assessment",
  "Claims Agent Review",
  "Final Resolution",
] as const;
const SUBMISSION_STEPS = 3;

export interface UploadedPhoto {
  slotId: string;
  name: string;
  url: string;
  uploadedAt: number;
}

function Index() {
  const [step, setStep] = useState(1);
  const [claimForm, setClaimForm] = useState<ClaimForm | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [claimRef, setClaimRef] = useState<string>("");
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const [finalized, setFinalized] = useState(false);

  const reset = () => {
    setClaimForm(null);
    setUploadedPhotos([]);
    setSubmitted(false);
    setClaimRef("");
    setSubmittedAt(null);
    setFinalized(false);
    setStep(1);
  };

  const showConfirmation = step === 2 && submitted;

  // Map internal step (1-4) + flags to a visual 6-step position
  const visualStep = (() => {
    if (step === 1) return 1;
    if (step === 2 && !submitted) return 2;
    if (showConfirmation) return 3;
    if (step === 3) return 4;
    if (step === 4 && !finalized) return 5;
    if (step === 4 && finalized) return 6;
    return step;
  })();

  return (
    <div
      className="flex flex-col h-screen"
      style={{ backgroundColor: COLORS.bg, color: COLORS.text }}
    >
      <StepIndicator current={visualStep} />
      <div
        key={showConfirmation ? "confirmation" : step}
        className="flex-1 min-h-0 flex flex-col animate-fade-in"
      >
        {step === 1 && (
          <InitiateClaimStep
            initial={claimForm}
            onContinue={(data) => {
              setClaimForm(data);
              setStep(2);
            }}
          />
        )}
        {step === 2 && !submitted && (
          <UploadPhotosStep
            initialPhotos={uploadedPhotos}
            onContinue={(photos) => {
              setUploadedPhotos(photos);
              const ref = `CLM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
              setClaimRef(ref);
              setSubmittedAt(Date.now());
              setSubmitted(true);
            }}
            onBack={() => setStep(1)}
          />
        )}
        {showConfirmation && (
          <SubmissionConfirmationStep
            claimRef={claimRef}
            submittedAt={submittedAt ?? Date.now()}
            claimForm={claimForm}
            onOpenForReview={() => {
              setSubmitted(false);
              setStep(3);
            }}
          />
        )}
        {step === 3 && <DraftAssessmentStep claimForm={claimForm} onComplete={() => setStep(4)} />}
        {step === 4 && (
          <ReviewEstimateStep
            claimForm={claimForm}
            uploadedPhotos={uploadedPhotos}
            claimRef={claimRef || `CLM-${new Date().getFullYear()}-000000`}
            onReset={reset}
            onFinalize={setFinalized}
          />
        )}
      </div>
    </div>
  );
}

function SubmissionConfirmationStep({
  claimRef,
  submittedAt,
  claimForm,
  onOpenForReview,
}: {
  claimRef: string;
  submittedAt: number;
  claimForm: ClaimForm | null;
  onOpenForReview: () => void;
}) {
  const submittedLabel = new Date(submittedAt).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const policy = claimForm?.policyNumber?.trim() || "—";
  const vehicle =
    [claimForm?.year, claimForm?.make, claimForm?.model].filter(Boolean).join(" ").trim() || "—";

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span style={{ color: COLORS.muted }}>{label}</span>
      <span className="text-right font-medium" style={{ color: COLORS.text }}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="flex-1 min-h-0 overflow-auto px-6 py-10">
      <div className="max-w-xl mx-auto">
        <div
          className="rounded-lg border p-8 text-center"
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        >
          <div className="flex justify-center mb-4">
            <CheckCircle size={48} strokeWidth={1.5} style={{ color: COLORS.green }} />
          </div>
          <h2 className="text-xl font-semibold" style={{ color: COLORS.text }}>
            Claim Submitted
          </h2>
          <div className="mt-1 text-sm" style={{ color: COLORS.muted }}>
            Claim Reference: <span style={{ color: COLORS.text }}>#{claimRef}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: COLORS.muted }}>
            Your claim details and uploaded photos have been received. A claims agent
            will review the submitted damage and continue processing the estimate.
          </p>

          <div
            className="mt-6 pt-4 border-t text-left divide-y"
            style={{ borderColor: COLORS.border }}
          >
            <Row label="Submitted" value={submittedLabel} />
            <Row label="Policy" value={policy} />
            <Row label="Vehicle" value={vehicle} />
            <Row label="Status" value="Awaiting Claims Review" />
          </div>
        </div>

        <div className="my-8 flex items-center gap-3">
          <div className="flex-1 h-px" style={{ backgroundColor: COLORS.border }} />
          <span
            className="text-[11px] font-semibold tracking-wider uppercase"
            style={{ color: COLORS.muted }}
          >
            Claims Agent Workspace
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: COLORS.border }} />
        </div>

        <div className="flex justify-center">
          <button
            onClick={onOpenForReview}
            className="px-5 py-2 text-sm font-medium rounded border transition-colors"
            style={{
              borderColor: COLORS.blue,
              color: COLORS.blue,
              backgroundColor: COLORS.surface,
            }}
          >
            Open Claim for Review
          </button>
        </div>
      </div>
    </div>
  );
}


function StepIndicator({ current }: { current: number }) {
  const submissionActive = current <= SUBMISSION_STEPS;
  const submissionDone = current > SUBMISSION_STEPS;
  const reviewActive = current > SUBMISSION_STEPS;
  return (
    <div
      className="shrink-0 border-b px-6 py-3"
      style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="flex items-center gap-2" style={{ flex: SUBMISSION_STEPS }}>
            <span
              className="text-[10px] font-semibold tracking-wider uppercase"
              style={{
                color: submissionDone
                  ? COLORS.greenText
                  : submissionActive
                    ? COLORS.text
                    : COLORS.muted,
              }}
            >
              Claim Submission
            </span>
          </div>
          <div
            className="flex items-center gap-2"
            style={{ flex: STEPS.length - SUBMISSION_STEPS }}
          >
            <span
              className="text-[10px] font-semibold tracking-wider uppercase"
              style={{ color: reviewActive ? COLORS.text : COLORS.muted }}
            >
              Claims Review
            </span>
          </div>
        </div>
        <ol className="flex items-center gap-2">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const active = n === current;
            const done = n < current;
            const fg = active ? COLORS.blue : done ? COLORS.greenText : COLORS.muted;
            const bg = active ? COLORS.blue : done ? COLORS.green : "#E5E7EB";
            const textColor = active || done ? "#FFFFFF" : COLORS.muted;
            return (
              <li key={label} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-semibold shrink-0 transition-colors duration-300"
                    style={{ backgroundColor: bg, color: textColor }}
                  >
                    {done ? <Check size={12} strokeWidth={3} /> : n}
                  </span>
                  <span
                    className="text-xs font-semibold truncate transition-colors duration-300"
                    style={{ color: fg }}
                  >
                    {label}
                  </span>
                </div>
                {n < STEPS.length && (
                  <span
                    className="flex-1 h-px"
                    style={{
                      backgroundColor:
                        n === SUBMISSION_STEPS
                          ? submissionDone && reviewActive
                            ? COLORS.green
                            : "#E5E7EB"
                          : done
                            ? COLORS.green
                            : "#E5E7EB",
                    }}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function SimpleStep({
  title,
  description,
  ctaLabel,
  onContinue,
  onBack,
}: {
  title: string;
  description: string;
  ctaLabel: string;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm mt-2" style={{ color: COLORS.muted }}>
          {description}
        </p>
        <div
          className="mt-6 rounded-lg border border-dashed flex items-center justify-center text-sm h-64"
          style={{ borderColor: "#D1D5DB", color: COLORS.muted, backgroundColor: COLORS.surface }}
        >
          {title} workspace
        </div>
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-sm font-medium px-4 py-2 rounded-md border"
            style={{ borderColor: "#D1D5DB", color: COLORS.text, backgroundColor: COLORS.surface }}
          >
            ← Back
          </button>
          <button
            onClick={onContinue}
            className="text-sm font-semibold text-white px-6 py-2.5 rounded-md transition-colors"
            style={{ backgroundColor: COLORS.blue }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.blueHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.blue)}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

interface PhotoSlot {
  id: string;
  name: string;
  guidance: string;
  required: boolean;
  icon: string;
}

const PHOTO_SLOTS: PhotoSlot[] = [
  {
    id: "primary",
    name: "Primary Damage View",
    guidance:
      "Clear close-up photo of the main damaged area. Ensure the full extent of visible damage is shown.",
    required: true,
    icon: "◎",
  },
  {
    id: "wide",
    name: "Wide Context Shot",
    guidance:
      "Step back slightly to show the damaged area in relation to surrounding vehicle panels.",
    required: true,
    icon: "◰",
  },
  {
    id: "angle",
    name: "Second Damage Angle",
    guidance:
      "Capture the same damaged area from a different angle to help assess depth, deformation, or hidden extent.",
    required: true,
    icon: "◳",
  },
];

const MIN_REQUIRED = 3;

function UploadPhotosStep({
  initialPhotos,
  onContinue,
  onBack,
}: {
  initialPhotos: UploadedPhoto[];
  onContinue: (photos: UploadedPhoto[]) => void;
  onBack: () => void;
}) {
  const [photos, setPhotos] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    initialPhotos.forEach((p) => {
      map[p.slotId] = p.url;
    });
    return map;
  });
  const [photoTimes, setPhotoTimes] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    initialPhotos.forEach((p) => {
      map[p.slotId] = p.uploadedAt;
    });
    return map;
  });
  const [extraPhotos, setExtraPhotos] = useState<{ id: string; url: string }[]>([]);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const extraInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (slotId: string, file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotos((prev) => ({ ...prev, [slotId]: url }));
    setPhotoTimes((prev) => ({ ...prev, [slotId]: Date.now() }));
  };

  const handleExtraSelect = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files).map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url: URL.createObjectURL(f),
    }));
    setExtraPhotos((prev) => [...prev, ...next]);
  };

  const removeExtra = (id: string) => {
    setExtraPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const required = PHOTO_SLOTS;
  const uploadedCount = required.filter((s) => photos[s.id]).length;
  const sufficient = uploadedCount >= MIN_REQUIRED;

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Upload Photos</h2>
          <p className="text-sm mt-1" style={{ color: COLORS.muted }}>
            Capture the damaged area from multiple angles to enable an accurate draft assessment.
          </p>
        </div>

        {/* Quality guidance banner */}
        <div
          className="rounded-lg border p-4 mb-5"
          style={{ backgroundColor: "#F9FAFB", borderColor: COLORS.border }}
        >
          <h3 className="text-sm font-semibold mb-2" style={{ color: COLORS.text }}>
            Photo Quality Requirements
          </h3>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-xs" style={{ color: COLORS.muted }}>
            <li>• <span style={{ color: COLORS.text }}>In focus</span> — avoid blurry or motion-blurred images</li>
            <li>• <span style={{ color: COLORS.text }}>Well-lit</span> — avoid shadows covering damage</li>
            <li>• <span style={{ color: COLORS.text }}>High resolution</span> — minimum 2MP recommended</li>
            <li>• <span style={{ color: COLORS.text }}>Unobstructed</span> — ensure the damaged area is fully visible</li>
          </ul>
        </div>

        {/* Requirements panel */}
        <div
          className="rounded-lg border p-4 mb-5"
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold" style={{ color: COLORS.text }}>
                Damage Photos Required ({MIN_REQUIRED} minimum)
              </h3>
              <div className="relative">
                <button
                  type="button"
                  onMouseEnter={() => setTooltipOpen(true)}
                  onMouseLeave={() => setTooltipOpen(false)}
                  onFocus={() => setTooltipOpen(true)}
                  onBlur={() => setTooltipOpen(false)}
                  aria-label="Why 3 photos?"
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold border"
                  style={{ borderColor: "#D1D5DB", color: COLORS.muted }}
                >
                  i
                </button>
                {tooltipOpen && (
                  <div
                    role="tooltip"
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-72 rounded-md border shadow-lg p-3 text-xs animate-fade-in"
                    style={{
                      backgroundColor: COLORS.surface,
                      borderColor: COLORS.border,
                      color: COLORS.text,
                    }}
                  >
                    <span className="font-semibold">Why 3 photos?</span> A single image may not capture the full extent or depth of damage. Multiple views help cross-check visible damage and reduce the risk of under- or over-estimation.
                  </div>
                )}
              </div>
            </div>
            <div
              className="text-xs font-semibold tabular-nums px-2.5 py-1 rounded-md"
              style={{
                backgroundColor: sufficient ? COLORS.greenBg : "#F3F4F6",
                color: sufficient ? COLORS.greenText : COLORS.muted,
                border: `1px solid ${sufficient ? "#BBF7D0" : COLORS.border}`,
              }}
            >
              {uploadedCount} of {MIN_REQUIRED} uploaded
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: "#F3F4F6" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(uploadedCount / MIN_REQUIRED, 1) * 100}%`,
                backgroundColor: sufficient ? COLORS.green : COLORS.blue,
              }}
            />
          </div>
        </div>

        {/* Required photo slots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-5">
          {required.map((slot) => (
            <PhotoCard
              key={slot.id}
              slot={slot}
              previewUrl={photos[slot.id]}
              onSelect={(f) => handleSelect(slot.id, f)}
            />
          ))}
        </div>

        {/* Sufficiency message */}
        {sufficient ? (
          <div
            className="rounded-md border px-4 py-3 mb-5 animate-fade-in"
            style={{ backgroundColor: COLORS.greenBg, borderColor: "#BBF7D0", color: COLORS.greenText }}
          >
            <div className="text-sm font-medium">✓ Minimum photo coverage met.</div>
            <div className="text-xs mt-0.5">
              You may upload additional photos for a more accurate assessment, or continue now.
            </div>
          </div>
        ) : uploadedCount === 2 ? (
          <div
            className="rounded-md border px-4 py-3 mb-5 text-sm animate-fade-in"
            style={{ backgroundColor: COLORS.amberBg, borderColor: COLORS.amberBorder, color: COLORS.amberText }}
          >
            ⚠ 1 more photo required. Please upload a second angle of the damage.
          </div>
        ) : (
          <div
            className="rounded-md border px-4 py-3 mb-5 text-sm animate-fade-in"
            style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA", color: "#991B1B" }}
          >
            At least 3 photos of the damaged area are required before assessment can begin.
          </div>
        )}

        {/* Optional photos */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: COLORS.text }}>
                Additional Photos <span style={{ color: COLORS.muted }}>(Optional)</span>
              </h3>
              <p className="text-xs mt-0.5" style={{ color: COLORS.muted }}>
                e.g. secondary damage, wheel damage, interior, dashboard warnings, environment.
              </p>
            </div>
            <button
              type="button"
              onClick={() => extraInputRef.current?.click()}
              className="text-xs font-medium px-3 py-2 rounded-md border shrink-0"
              style={{ borderColor: "#D1D5DB", color: COLORS.text, backgroundColor: COLORS.surface }}
            >
              + Add More Photos
            </button>
            <input
              ref={extraInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handleExtraSelect(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
          {extraPhotos.length > 0 && (
            <div className="flex gap-2 overflow-x-auto py-2">
              {extraPhotos.map((p) => (
                <div
                  key={p.id}
                  className="relative shrink-0 w-20 h-20 rounded-md overflow-hidden border"
                  style={{ borderColor: COLORS.border }}
                >
                  <img src={p.url} alt="Additional" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExtra(p.id)}
                    aria-label="Remove photo"
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-sm font-medium px-4 py-2 rounded-md border"
            style={{ borderColor: "#D1D5DB", color: COLORS.text, backgroundColor: COLORS.surface }}
          >
            ← Back
          </button>
          <button
            onClick={() => {
              const out: UploadedPhoto[] = PHOTO_SLOTS.filter((s) => photos[s.id]).map((s) => ({
                slotId: s.id,
                name: s.name,
                url: photos[s.id],
                uploadedAt: photoTimes[s.id] ?? Date.now(),
              }));
              onContinue(out);
            }}
            disabled={!sufficient}
            className="text-sm font-semibold px-6 py-3 rounded-md transition-colors"
            style={{
              backgroundColor: sufficient ? COLORS.blue : "#E5E7EB",
              color: sufficient ? "#FFFFFF" : "#9CA3AF",
              cursor: sufficient ? "pointer" : "not-allowed",
            }}
            onMouseEnter={(e) => {
              if (sufficient) e.currentTarget.style.backgroundColor = COLORS.blueHover;
            }}
            onMouseLeave={(e) => {
              if (sufficient) e.currentTarget.style.backgroundColor = COLORS.blue;
            }}
          >
            Generate Draft Assessment →
          </button>
        </div>
      </div>
    </div>
  );
}


function PhotoCard({
  slot,
  previewUrl,
  onSelect,
}: {
  slot: PhotoSlot;
  previewUrl?: string;
  onSelect: (file: File | undefined) => void;
}) {
  const inputId = `photo-${slot.id}`;
  const uploaded = !!previewUrl;
  return (
    <label
      htmlFor={inputId}
      className="group relative flex flex-col rounded-lg border cursor-pointer transition-colors overflow-hidden"
      style={{
        backgroundColor: COLORS.surface,
        borderColor: uploaded ? "#BBF7D0" : "#D1D5DB",
        borderStyle: uploaded ? "solid" : "dashed",
      }}
    >
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onSelect(e.target.files?.[0])}
      />
      <div
        className="relative flex items-center justify-center h-28"
        style={{ backgroundColor: uploaded ? "#000" : "#F9FAFB" }}
      >
        {uploaded ? (
          <img src={previewUrl} alt={slot.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <span className="text-2xl" style={{ color: COLORS.muted }}>{slot.icon}</span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1">
        <div className="text-sm font-semibold leading-tight" style={{ color: COLORS.text }}>
          {slot.name}
        </div>
        <div className="text-[11px]" style={{ color: COLORS.muted }}>
          {slot.guidance}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold">
          {uploaded ? (
            <>
              <span style={{ color: COLORS.greenText }}>✓ Uploaded</span>
            </>
          ) : slot.required ? (
            <span style={{ color: "#DC2626" }}>Required</span>
          ) : (
            <span style={{ color: COLORS.muted }}>Optional</span>
          )}
        </div>
      </div>
    </label>
  );
}

const REFERENCE_SOURCES = [
  "Mitchell RepairCenter",
  "CCC Parts Database",
  "OEM Repair Guidelines",
];

const PROCESSING_STEPS_BASE: { label: (cf: ClaimForm | null) => string; duration: number }[] = [
  { label: () => "Photo quality validation complete — all required views meet minimum clarity standards", duration: 600 },
  { label: (cf) => {
      const v = cf ? [cf.year, cf.make, cf.model].filter(Boolean).join(" ").trim() : "";
      return `Vehicle identified: ${v || "—"}`;
    }, duration: 600 },
  { label: () => "Analyzing visible damage regions and identifying affected parts…", duration: 1100 },
  { label: () => "Cross-checking repair scope against repair-cost references…", duration: 1000 },
  { label: () => "Claim complexity evaluated — routing to appropriate review workflow", duration: 600 },
];

function DraftAssessmentStep({ claimForm, onComplete }: { claimForm: ClaimForm | null; onComplete: () => void }) {
  const PROCESSING_STEPS = PROCESSING_STEPS_BASE.map((s) => ({ label: s.label(claimForm), duration: s.duration }));
  // activeIndex = index of currently-processing step; PROCESSING_STEPS.length means all done
  const [activeIndex, setActiveIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [refIndex, setRefIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= PROCESSING_STEPS.length) {
      setDone(true);
      const t = setTimeout(onComplete, 1000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(
      () => setActiveIndex((i) => i + 1),
      PROCESSING_STEPS[activeIndex].duration,
    );
    return () => clearTimeout(t);
  }, [activeIndex, onComplete]);

  // Rotate reference sources while step 4 (index 3) is active
  useEffect(() => {
    if (activeIndex !== 3) return;
    const t = setInterval(() => setRefIndex((i) => (i + 1) % REFERENCE_SOURCES.length), 500);
    return () => clearInterval(t);
  }, [activeIndex]);

  return (
    <div className="flex-1 overflow-auto flex items-center justify-center">
      <div
        className="w-full max-w-xl mx-6 my-10 rounded-lg border p-8 animate-fade-in"
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
      >
        {done ? (
          <div className="flex flex-col items-center text-center gap-2 animate-fade-in py-4">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-full"
              style={{ backgroundColor: COLORS.greenBg, color: COLORS.greenText, border: "1px solid #BBF7D0" }}
            >
              <span className="text-xl font-bold">✓</span>
            </div>
            <h2 className="text-lg font-semibold mt-1">Draft assessment complete</h2>
            <p className="text-sm" style={{ color: COLORS.muted }}>
              Opening Claims Review Cockpit…
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold tracking-tight">Generating Draft Assessment</h2>
              <p className="text-sm mt-1" style={{ color: COLORS.muted }}>
                Reviewing submitted claim information and uploaded photos
              </p>
            </div>

            <ol className="flex flex-col gap-3">
              {PROCESSING_STEPS.map((step, i) => {
                if (i > activeIndex) return null;
                const isDoneStep = i < activeIndex;
                const isActive = i === activeIndex;
                return (
                  <li
                    key={i}
                    className="flex items-start gap-3 animate-fade-in"
                  >
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full shrink-0 mt-0.5"
                      style={{
                        backgroundColor: isDoneStep ? COLORS.greenBg : "#F3F4F6",
                        border: `1px solid ${isDoneStep ? "#BBF7D0" : COLORS.border}`,
                      }}
                    >
                      {isDoneStep ? (
                        <span className="text-xs font-bold" style={{ color: COLORS.greenText }}>✓</span>
                      ) : (
                        <Spinner />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm leading-snug"
                        style={{ color: isActive ? COLORS.text : isDoneStep ? COLORS.text : COLORS.muted }}
                      >
                        {step.label}
                      </div>
                      {isActive && i === 3 && (
                        <div
                          key={refIndex}
                          className="text-xs mt-1.5 animate-fade-in"
                          style={{ color: COLORS.muted }}
                        >
                          Referencing: <span style={{ color: COLORS.text }}>{REFERENCE_SOURCES[refIndex]}</span>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block w-3 h-3 rounded-full border-2 animate-spin"
      style={{
        borderColor: "#E5E7EB",
        borderTopColor: COLORS.blue,
      }}
    />
  );
}


const INCIDENT_TYPES = [
  "Rear-end collision",
  "Side impact",
  "Front collision",
  "Hail / Weather",
  "Vandalism",
  "Single vehicle",
  "Other",
] as const;

type PolicyLookup = {
  fullName: string;
  year: string;
  make: string;
  model: string;
  coverage: "full" | "third_party";
  deductible: string | null;
};

function lookupPolicy(policyNumber: string): PolicyLookup | null {
  const p = policyNumber.trim().toUpperCase();
  if (p.startsWith("POL-2026"))
    return { fullName: "Sarah Al-Mansouri", year: "2023", make: "Toyota", model: "Camry XSE", coverage: "full", deductible: "500" };
  if (p.startsWith("POL-2025"))
    return { fullName: "Omar Al-Kuwari", year: "2021", make: "Honda", model: "CR-V EX", coverage: "full", deductible: "500" };
  return null;
}


type PoliceReportStatus = "uploaded" | "pending" | "not_available" | "";
type CoverageType = "full" | "third_party" | "";
type FaultDetermination = "policyholder" | "other" | "unclear" | "single_vehicle" | "";

interface ClaimForm {
  policyNumber: string;
  fullName: string;
  dateOfLoss: string;
  contactPhone: string;
  incidentType: string;
  incidentTypeOther: string;
  description: string;
  location: string;
  year: string;
  make: string;
  model: string;
  vin: string;
  vehicleAutoFilled: boolean;
  policeReport: PoliceReportStatus;
  coverage: CoverageType;
  fault: FaultDetermination;
  deductible: string;
}

const emptyForm = (): ClaimForm => ({
  policyNumber: "",
  fullName: "",
  dateOfLoss: new Date().toISOString().slice(0, 10),
  contactPhone: "",
  incidentType: "",
  incidentTypeOther: "",
  description: "",
  location: "",
  year: "",
  make: "",
  model: "",
  vin: "",
  vehicleAutoFilled: false,
  policeReport: "",
  coverage: "",
  fault: "",
  deductible: "",
});


const demoForm = (): ClaimForm => {
  const policyNumber = "POL-2026-48201";
  const lookup = lookupPolicy(policyNumber)!;
  return {
    policyNumber,
    fullName: lookup.fullName,
    dateOfLoss: new Date().toISOString().slice(0, 10),
    contactPhone: "(415) 555-0142",
    incidentType: "Rear-end collision",
    incidentTypeOther: "",
    description:
      "Vehicle was struck from behind at a stoplight on Market St. Visible damage to rear bumper and trunk area. No airbag deployment.",
    location: "Market St & 5th Ave, San Francisco, CA",
    year: lookup.year,
    make: lookup.make,
    model: lookup.model,
    vin: "4T1G11AK5NU712398",
    vehicleAutoFilled: true,
    policeReport: "uploaded",
    coverage: lookup.coverage,
    fault: "other",
    deductible: lookup.deductible ?? "",
  };
};




function InitiateClaimStep({
  initial,
  onContinue,
}: {
  initial: ClaimForm | null;
  onContinue: (data: ClaimForm) => void;
}) {
  const [form, setForm] = useState<ClaimForm>(() => initial ?? emptyForm());
  const [errors, setErrors] = useState<Partial<Record<keyof ClaimForm, string>>>({});
  const [policyMsg, setPolicyMsg] = useState<string | null>(null);

  // Coverage Eligibility Check (gates the intake form)
  type Fault = "policyholder" | "other" | "unclear" | "single_vehicle" | "";
  const [eligPolicy, setEligPolicy] = useState("");
  const [fault, setFault] = useState<Fault>("");
  // deductible is retrieved from policy lookup — no manual input
  const [validated, setValidated] = useState<ValidatedPolicy | null>(null);
  const [eligibilityPassed, setEligibilityPassed] = useState(false);

  const eligibility = (() => {
    if (!validated || !fault) return null;
    if (fault === "policyholder") {
      return { tone: "green" as const, title: "Coverage confirmed.", body: "This policy includes coverage for the reported vehicle damage. Deductible may apply.", action: "Continue Claim Review", showDeductible: true, canContinue: true };
    }
    if (fault === "other") {
      return { tone: "green" as const, title: "Coverage confirmed.", body: "Vehicle damage is eligible for claim processing under this policy.", action: "Continue Claim Review", canContinue: true };
    }
    if (fault === "unclear") {
      return { tone: "amber" as const, title: "Claim eligible for review.", body: "Additional verification may be required before final authorization.", action: "Continue Claim Review", canContinue: true };
    }
    if (fault === "single_vehicle") {
      return { tone: "green" as const, title: "Coverage confirmed.", body: "Single-vehicle incidents are eligible for claim processing under this policy.", action: "Continue Claim Review", canContinue: true };
    }
    return null;
  })();


  const update = <K extends keyof ClaimForm>(key: K, value: ClaimForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<keyof ClaimForm, string>> = {};
    if (!form.policyNumber.trim()) next.policyNumber = "Policy number is required.";
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!form.dateOfLoss) next.dateOfLoss = "Date of loss is required.";
    if (!form.incidentType) next.incidentType = "Select an incident type.";
    if (form.incidentType === "Other" && !form.incidentTypeOther.trim())
      next.incidentTypeOther = "Please describe the incident type.";
    if (!form.description.trim()) next.description = "Brief description is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePolicyBlur = () => {
    const value = form.policyNumber.trim();
    if (!value) {
      setPolicyMsg(null);
      return;
    }
    const result = lookupPolicy(value);
    if (result) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName.trim() ? prev.fullName : result.fullName,
        year: result.year,
        make: result.make,
        model: result.model,
        vehicleAutoFilled: true,
      }));
      setPolicyMsg(null);
    } else {
      setForm((prev) => ({
        ...prev,
        year: "",
        make: "",
        model: "",
        vehicleAutoFilled: false,
      }));
      setPolicyMsg("Policy not found. Please enter vehicle details manually.");
    }
  };

  const handleSubmit = () => {
    if (validate()) onContinue(form);
  };



  const charCount = form.description.length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {!eligibilityPassed ? (
          <EligibilityCheck
            policyNumber={eligPolicy}
            setPolicyNumber={setEligPolicy}
            fullName={form.fullName}
            setFullName={(v) => update("fullName", v)}
            fault={fault}
            setFault={(v) => { setFault(v); }}
            validated={validated}
            setValidated={setValidated}
            eligibility={eligibility}
            onContinue={() => {
              if (validated) {
                setForm((prev) => ({
                  ...prev,
                  policyNumber: validated.policyNumber,
                  year: validated.year,
                  make: validated.make,
                  model: validated.model,
                  vehicleAutoFilled: true,
                  coverage: validated.coverage,
                  fault: fault || "",
                  deductible: validated.deductible ?? "",
                }));
              }
              setEligibilityPassed(true);
            }}

          />

        ) : (
        <div>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Initiate Claim</h2>
            <p className="text-sm mt-1" style={{ color: COLORS.muted }}>
              Provide policyholder, incident, and vehicle information to begin a new claim.
            </p>
          </div>
          <button
            onClick={() => {
              setForm(demoForm());
              setErrors({});
            }}
            className="text-xs font-medium px-3 py-2 rounded-md border shrink-0"
            style={{ borderColor: "#D1D5DB", color: COLORS.text, backgroundColor: COLORS.surface }}
          >
            Use Demo Claim
          </button>
        </div>


        <FormSection title="Policyholder Information">
          <Field label="Policy Number" required error={errors.policyNumber}>
            <TextInput
              value={form.policyNumber}
              onChange={(v) => update("policyNumber", v)}
              onBlur={handlePolicyBlur}
              placeholder="POL-2026-XXXXX"
              invalid={!!errors.policyNumber}
            />
            {policyMsg && (
              <p className="text-[11px] mt-1" style={{ color: COLORS.amberText }}>
                {policyMsg}
              </p>
            )}
          </Field>
          <Field label="Full Name" required error={errors.fullName}>
            <TextInput
              value={form.fullName}
              onChange={(v) => update("fullName", v)}
              placeholder="Jane Doe"
              invalid={!!errors.fullName}
            />
          </Field>
          <Field label="Date of Loss" required error={errors.dateOfLoss}>
            <TextInput
              type="date"
              value={form.dateOfLoss}
              onChange={(v) => update("dateOfLoss", v)}
              invalid={!!errors.dateOfLoss}
            />
          </Field>
          <Field label="Contact Phone">
            <TextInput
              value={form.contactPhone}
              onChange={(v) => update("contactPhone", v)}
              placeholder="(555) 555-0123"
            />
          </Field>
        </FormSection>

        <FormSection title="Incident Details">
          <Field label="Incident Type" required error={errors.incidentType} className="md:col-span-2">
            <select
              value={form.incidentType}
              onChange={(e) => update("incidentType", e.target.value)}
              className="w-full h-10 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: errors.incidentType ? "#DC2626" : "#D1D5DB",
                backgroundColor: COLORS.surface,
                color: form.incidentType ? COLORS.text : COLORS.muted,
              }}
            >
              <option value="">Select incident type…</option>
              {INCIDENT_TYPES.map((t) => (
                <option key={t} value={t} style={{ color: COLORS.text }}>
                  {t}
                </option>
              ))}
            </select>
            {form.incidentType === "Other" && (
              <div className="mt-2 animate-fade-in">
                <TextInput
                  value={form.incidentTypeOther}
                  onChange={(v) => update("incidentTypeOther", v)}
                  placeholder="Please describe the incident type"
                  invalid={!!errors.incidentTypeOther}
                />
                {errors.incidentTypeOther && (
                  <p className="text-[11px] mt-1" style={{ color: "#DC2626" }}>
                    {errors.incidentTypeOther}
                  </p>
                )}
              </div>
            )}
            <p className="text-[11px] mt-2" style={{ color: COLORS.muted }}>
              This form is for own-vehicle damage claims only.
            </p>
          </Field>
          <Field
            label="Brief Description"
            required
            error={errors.description}
            className="md:col-span-2"
          >
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value.slice(0, 300))}
              rows={4}
              placeholder="Describe what happened…"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              style={{
                borderColor: errors.description ? "#DC2626" : "#D1D5DB",
                backgroundColor: COLORS.surface,
                color: COLORS.text,
              }}
            />
            <div className="flex justify-end text-[11px] mt-1" style={{ color: COLORS.muted }}>
              {charCount}/300
            </div>
          </Field>
          <Field label="Location of Incident" className="md:col-span-2">
            <TextInput
              value={form.location}
              onChange={(v) => update("location", v)}
              placeholder="Street, city, state"
            />
          </Field>
        </FormSection>

        <FormSection title="Documentation">
          <Field label="Police Report Status" className="md:col-span-2">
            <select
              value={form.policeReport}
              onChange={(e) => update("policeReport", e.target.value as PoliceReportStatus)}
              className="w-full h-10 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderColor: "#D1D5DB",
                backgroundColor: COLORS.surface,
                color: form.policeReport ? COLORS.text : COLORS.muted,
              }}
            >
              <option value="">Select status…</option>
              <option value="uploaded">Uploaded</option>
              <option value="pending">Pending</option>
              <option value="not_available">Not Available</option>
            </select>
            {form.policeReport === "uploaded" && (
              <div
                className="mt-2 rounded-md border px-3 py-2 text-xs"
                style={{ backgroundColor: "#F0FDF4", borderColor: "#BBF7D0", color: "#15803D" }}
              >
                <span className="font-semibold">✓ Police report on file.</span>
              </div>
            )}
            {form.policeReport === "pending" && (
              <div
                className="mt-2 rounded-md border px-3 py-2 text-xs"
                style={{ backgroundColor: "#FFFBEB", borderColor: "#FCD34D", color: "#92400E" }}
              >
                Authorization may be paused until police report is received.
              </div>
            )}
            {form.policeReport === "not_available" && (
              <div
                className="mt-2 rounded-md border px-3 py-2 text-xs"
                style={{ backgroundColor: "#FFFBEB", borderColor: "#FCD34D", color: "#92400E" }}
              >
                Verification recommended before authorization.
              </div>
            )}
            <p className="text-[11px] mt-2" style={{ color: COLORS.muted }}>
              Police report verification would be handled through document review or external authority integration in production.
            </p>
          </Field>
        </FormSection>



        <FormSection title="Vehicle Information">
          {form.vehicleAutoFilled && (
            <div
              className="md:col-span-2 -mt-1 mb-1 inline-flex items-center gap-2 text-[11px] font-medium px-2 py-1 rounded"
              style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8", width: "fit-content" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#1D4ED8" }} />
              Retrieved from policy record
            </div>
          )}
          {form.vehicleAutoFilled && (
            <>
              <Field label="Year">
                <TextInput
                  type="number"
                  value={form.year}
                  onChange={(v) => update("year", v)}
                  placeholder="2024"
                  highlight
                />
              </Field>
              <Field label="Make">
                <TextInput
                  value={form.make}
                  onChange={(v) => update("make", v)}
                  placeholder="Toyota"
                  highlight
                />
              </Field>
              <Field label="Model">
                <TextInput
                  value={form.model}
                  onChange={(v) => update("model", v)}
                  placeholder="Camry"
                  highlight
                />
              </Field>
            </>
          )}
          <Field label="VIN" className="md:col-span-2">
            <TextInput
              value={form.vin}
              onChange={(v) => update("vin", v)}
              placeholder="Auto-populated where available"
            />
          </Field>
        </FormSection>


        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            className="text-sm font-semibold text-white px-6 py-3 rounded-md transition-colors"
            style={{ backgroundColor: COLORS.blue }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.blueHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.blue)}
          >
            Begin Photo Submission →
          </button>
        </div>
        </div>

        )}
      </div>
    </div>
  );
}


type FaultVal = "policyholder" | "other" | "unclear" | "single_vehicle" | "";
type ValidatedPolicy = { policyNumber: string; year: string; make: string; model: string; coverage: "full" | "third_party"; deductible: string | null };
interface EligibilityResult {
  tone: "amber" | "blue" | "green" | "red";
  title: string;
  body: string;
  action: string;
  note?: string;
  showDeductible?: boolean;
  canContinue: boolean;
}

function EligibilityCheck({
  policyNumber, setPolicyNumber, fullName, setFullName, fault, setFault, validated, setValidated, eligibility, onContinue,
}: {
  policyNumber: string;
  setPolicyNumber: (v: string) => void;
  fullName: string;
  setFullName: (v: string) => void;
  fault: FaultVal;
  setFault: (v: FaultVal) => void;
  validated: ValidatedPolicy | null;
  setValidated: (v: ValidatedPolicy | null) => void;
  eligibility: EligibilityResult | null;
  onContinue: () => void;
}) {

  const [validating, setValidating] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const toneStyles: Record<string, { bg: string; border: string; text: string }> = {
    amber: { bg: "#FFFBEB", border: "#FCD34D", text: "#92400E" },
    blue: { bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8" },
    green: { bg: "#F0FDF4", border: "#BBF7D0", text: "#15803D" },
    red: { bg: "#FEF2F2", border: "#FECACA", text: "#B91C1C" },
  };
  const faultOptions: { value: FaultVal; label: string }[] = [
    { value: "policyholder", label: "Policyholder at fault" },
    { value: "other", label: "Other party at fault" },
    { value: "unclear", label: "Fault unclear or disputed" },
    { value: "single_vehicle", label: "Single-vehicle incident" },
  ];

  const Radio = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <label className="flex items-center gap-2.5 py-2 cursor-pointer text-sm" style={{ color: COLORS.text }}>
      <span
        onClick={onChange}
        className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0"
        style={{ borderColor: checked ? COLORS.blue : "#D1D5DB", backgroundColor: COLORS.surface }}
      >
        {checked && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.blue }} />}
      </span>
      <input type="radio" checked={checked} onChange={onChange} className="sr-only" />
      <span onClick={onChange}>{label}</span>
    </label>
  );

  const runValidation = (v: string) => {
    setLookupError(null);
    setValidating(true);
    setValidated(null);
    window.setTimeout(() => {
      const result = lookupPolicy(v);
      if (!result) {
        setValidating(false);
        setLookupError("Policy not found. Please check the number and try again.");
        return;
      }
      setValidated({
        policyNumber: v,
        year: result.year,
        make: result.make,
        model: result.model,
        coverage: result.coverage,
        deductible: result.deductible,
      });
      if (!fullName.trim()) setFullName(result.fullName);
      setValidating(false);

    }, 700);
  };

  const handleValidate = () => {
    const v = policyNumber.trim();
    if (!v) { setLookupError("Policy number is required."); return; }
    runValidation(v);
  };

  const handlePolicyChange = (v: string) => {
    setPolicyNumber(v);
    if (validated) setValidated(null);
    if (lookupError) setLookupError(null);
  };


  const loadDemo = () => {
    const demoPolicy = "POL-2026-48201";
    setPolicyNumber(demoPolicy);
    setFault("other");
    runValidation(demoPolicy);
  };



  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Coverage Eligibility Check</h2>
          <p className="text-sm mt-1" style={{ color: COLORS.muted }}>
            We need a few details before beginning the claim review.
          </p>
        </div>
        <button
          type="button"
          onClick={loadDemo}
          className="text-xs font-medium px-3 py-2 rounded-md border shrink-0"
          style={{ borderColor: "#D1D5DB", color: COLORS.text, backgroundColor: COLORS.surface }}
        >
          Use Demo Claim
        </button>
      </div>

      <FormSection title="Policy Number">
        <div className="md:col-span-2">
          <label className="text-xs font-medium block mb-1.5" style={{ color: COLORS.text }}>
            Enter the policy number
          </label>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md">
            <div className="flex-1">
              <TextInput
                value={policyNumber}
                onChange={handlePolicyChange}
                placeholder="POL-2026-XXXXX"
                invalid={!!lookupError}
              />
            </div>
            <button
              onClick={handleValidate}
              disabled={validating || !policyNumber.trim()}
              className="text-sm font-medium px-4 py-2 rounded-md whitespace-nowrap transition-colors"
              style={{
                backgroundColor: validating || !policyNumber.trim() ? "#E5E7EB" : COLORS.blue,
                color: validating || !policyNumber.trim() ? COLORS.muted : "#FFFFFF",
                cursor: validating || !policyNumber.trim() ? "not-allowed" : "pointer",
              }}
            >
              {validating ? "Validating…" : validated ? "Re-validate" : "Validate Policy"}
            </button>
          </div>
          {lookupError && (
            <div className="text-[11px] mt-2" style={{ color: "#DC2626" }}>{lookupError}</div>
          )}
        </div>
      </FormSection>

      <FormSection title="Policyholder Name">
        <div className="md:col-span-2">
          <label className="text-xs font-medium block mb-1.5" style={{ color: COLORS.text }}>
            Full Name
          </label>
          <div className="max-w-md">
            <TextInput
              value={fullName || ""}
              onChange={(v) => setFullName(v)}
              placeholder="Jane Doe"
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Preliminary Fault Assessment">
        <div className="md:col-span-2">
          <p className="text-sm font-medium mb-2" style={{ color: COLORS.text }}>
            What is the current understanding of fault?
          </p>
          <div>
            {faultOptions.map((o) => (
              <Radio key={o.value} checked={fault === o.value} onChange={() => setFault(o.value)} label={o.label} />
            ))}
          </div>
          <p className="text-[11px] mt-2" style={{ color: COLORS.muted }}>
            This is a preliminary operational assessment and may change during formal review.
          </p>
        </div>
      </FormSection>

      {validated && (
        <div
          className="rounded-lg border p-5 mb-4 animate-fade-in"
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold"
              style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}
            >
              ✓
            </span>
            <h3 className="text-sm font-semibold" style={{ color: COLORS.text }}>
              Policy Validated
            </h3>
            <span className="text-[10px] uppercase ml-auto" style={{ color: COLORS.muted, letterSpacing: "0.08em" }}>
              Retrieved from policy record
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] uppercase mb-1" style={{ color: COLORS.muted, letterSpacing: "0.08em" }}>Coverage Type</div>
              <div className="text-sm font-medium" style={{ color: COLORS.text }}>
                Full Coverage Policy
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase mb-1" style={{ color: COLORS.muted, letterSpacing: "0.08em" }}>Policy Number</div>
              <div className="text-sm font-medium" style={{ color: COLORS.text }}>{validated.policyNumber}</div>
            </div>
            {fullName.trim() && (
              <div>
                <div className="text-[10px] uppercase mb-1" style={{ color: COLORS.muted, letterSpacing: "0.08em" }}>Policyholder</div>
                <div className="text-sm font-medium" style={{ color: COLORS.text }}>{fullName}</div>
              </div>
            )}
            <div className="sm:col-span-2">
              <div className="text-[10px] uppercase mb-1" style={{ color: COLORS.muted, letterSpacing: "0.08em" }}>Vehicle</div>
              <div className="text-sm font-medium" style={{ color: COLORS.text }}>
                {validated.year} {validated.make} {validated.model}
              </div>
            </div>
          </div>
        </div>
      )}

      {eligibility && (
        <div
          className="rounded-lg border p-5 mb-4 animate-fade-in"
          style={{
            backgroundColor: toneStyles[eligibility.tone].bg,
            borderColor: toneStyles[eligibility.tone].border,
          }}
        >
          <h3 className="text-sm font-semibold mb-1" style={{ color: toneStyles[eligibility.tone].text }}>
            {eligibility.title}
          </h3>
          {eligibility.body && (
            <p className="text-sm" style={{ color: COLORS.text }}>
              {eligibility.body}
            </p>
          )}
          {eligibility.note && (
            <p className="text-[12px] mt-2" style={{ color: COLORS.muted }}>
              {eligibility.note}
            </p>
          )}
          {validated && validated.coverage === "full" && (
            <div
              className="mt-4 rounded-lg"
              style={{
                backgroundColor: "#FFFFFF",
                border: "0.5px solid #E5E7EB",
                borderLeft: `3px solid ${fault === "policyholder" ? "#16A34A" : "#2563EB"}`,
                borderRadius: 8,
                padding: "12px 16px",
              }}
            >
              <div
                className="text-[11px] font-semibold uppercase mb-2"
                style={{ color: COLORS.muted, letterSpacing: "0.08em" }}
              >
                Policy Coverage Retrieved
              </div>
              <div className="flex flex-col gap-2">
                <div>
                  <div className="text-[11px] uppercase" style={{ color: COLORS.muted, letterSpacing: "0.08em" }}>
                    Coverage Type
                  </div>
                  <div className="text-sm font-medium" style={{ color: COLORS.text }}>
                    Comprehensive
                  </div>
                </div>
                {fault === "policyholder" ? (
                  <>
                    <div>
                      <div className="text-[11px] uppercase" style={{ color: COLORS.muted, letterSpacing: "0.08em" }}>
                        Deductible
                      </div>
                      <div className="text-sm font-medium tabular-nums" style={{ color: COLORS.text }}>
                        ${validated.deductible}
                      </div>
                    </div>
                    <div className="text-[11px] italic" style={{ color: COLORS.muted }}>
                      Deductible retrieved from policy record.
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="text-[11px] uppercase" style={{ color: COLORS.muted, letterSpacing: "0.08em" }}>
                        Deductible
                      </div>
                      <div className="text-sm font-medium" style={{ color: COLORS.text }}>
                        N/A — handled by at-fault party
                      </div>
                    </div>
                    <div className="text-[11px] italic" style={{ color: COLORS.muted }}>
                      No policyholder contribution required when the other party is at fault.
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                if (!eligibility.canContinue) return;
                onContinue();
              }}
              disabled={!eligibility.canContinue}
              className="text-sm font-semibold px-5 py-2.5 rounded-md transition-colors"
              style={{
                backgroundColor: eligibility.canContinue ? COLORS.blue : "#E5E7EB",
                color: eligibility.canContinue ? "#FFFFFF" : COLORS.muted,
                cursor: eligibility.canContinue ? "pointer" : "not-allowed",
              }}
            >
              {eligibility.action}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {

  return (
    <section
      className="rounded-lg border p-5 mb-4"
      style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
    >
      <h3
        className="text-[11px] font-semibold uppercase tracking-wider mb-4"
        style={{ color: COLORS.muted }}
      >
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  error,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-medium block mb-1.5" style={{ color: COLORS.text }}>
        {label}
        {required && <span style={{ color: "#DC2626" }}> *</span>}
      </label>
      {children}
      {error && (
        <div className="text-[11px] mt-1" style={{ color: "#DC2626" }}>
          {error}
        </div>
      )}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  invalid,
  highlight,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: string;
  invalid?: boolean;
  highlight?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      className="w-full h-10 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      style={{
        borderColor: invalid ? "#DC2626" : highlight ? "#BFDBFE" : "#D1D5DB",
        backgroundColor: highlight ? "#EFF6FF" : COLORS.surface,
        color: COLORS.text,
      }}
    />
  );
}

const ADJUSTER_NAME = "Sarah Chen, Senior Claims Adjuster";

type AuthorizationDetails = {
  amount: number;
  deductibleAmount: number;
  hasDeductible: boolean;
  authorizedAt: number;
};

function ReviewEstimateStep({
  claimForm,
  uploadedPhotos,
  claimRef,
  onReset,
  onFinalize,
}: {
  claimForm: ClaimForm | null;
  uploadedPhotos: UploadedPhoto[];
  claimRef: string;
  onReset: () => void;
  onFinalize?: (finalized: boolean) => void;
}) {
  const [selectedId, setSelectedId] = useState(claimData[0].id);
  const claim = useMemo(
    () => claimData.find((c) => c.id === selectedId) ?? claimData[0],
    [selectedId],
  );

  const [seniorReview, setSeniorReview] = useState(claim.delegationState === "SENIOR_AUTHORIZATION");
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [highlightedPart, setHighlightedPart] = useState<number | null>(null);
  const [concernsDismissed, setConcernsDismissed] = useState(false);
  const [authorization, setAuthorization] = useState<AuthorizationDetails | null>(null);
  const [seniorPending, setSeniorPending] = useState(false);
  const generateReportRef = useRef<((forAuthorization?: boolean) => Promise<void>) | null>(null);

  // Sync escalation when switching claims — auto-load senior authorization for SENIOR_AUTHORIZATION scenarios
  useEffect(() => {
    setSeniorReview(claim.delegationState === "SENIOR_AUTHORIZATION");
    setHighlightedPart(null);
    setConcernsDismissed(false);
    setAuthorization(null);
    setSeniorPending(false);
  }, [selectedId, claim.delegationState]);

  // Notify parent when claim reaches a final workflow state
  useEffect(() => {
    onFinalize?.(authorization !== null || seniorPending);
  }, [authorization, seniorPending, onFinalize]);

  const isFastTrack = claim.delegationState === "FAST_TRACK";

  const workflowState: "FAST_TRACK" | "VERIFICATION_RECOMMENDED" | "SENIOR_AUTHORIZATION" =
    seniorReview || claim.delegationState === "SENIOR_AUTHORIZATION"
      ? "SENIOR_AUTHORIZATION"
      : claim.delegationState;

  const workflowLabel = {
    FAST_TRACK: "Fast-Track",
    VERIFICATION_RECOMMENDED: "Verification Recommended",
    SENIOR_AUTHORIZATION: "Senior Authorization",
  }[workflowState];

  const workflowStyles = {
    FAST_TRACK: { bar: COLORS.green, bg: COLORS.greenBg, fg: COLORS.greenText },
    VERIFICATION_RECOMMENDED: { bar: COLORS.amber, bg: COLORS.amberBg, fg: COLORS.amberText },
    SENIOR_AUTHORIZATION: { bar: "#DC2626", bg: "#FEF2F2", fg: "#991B1B" },
  }[workflowState];

  const currentScenario = SCENARIOS.find((s) => s.id === selectedId) ?? SCENARIOS[0];

  // Unified Demo Claim: scenario overrides coverage + fault so policy details,
  // coverage status, escalation logic, and downstream panels all stay in sync.
  const effectiveClaimForm: ClaimForm | null = claimForm
    ? {
        ...claimForm,
        coverage: currentScenario.coverage,
        fault: currentScenario.fault,
        deductible: currentScenario.deductibleValue,
      }
    : null;

  return (
    <div
      className="flex flex-col flex-1 min-h-0"
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

      {/* Policyholder coverage status bar */}
      {effectiveClaimForm && (
        <div
          className="flex items-center gap-6 px-6 h-8 border-b shrink-0"
          style={{ backgroundColor: "#F9FAFB", borderColor: COLORS.border }}
        >
          <div className="flex items-center gap-2 text-[11px]">
            <span className="uppercase tracking-wider font-semibold" style={{ color: COLORS.muted, letterSpacing: "0.08em" }}>
              Coverage type:
            </span>
            <span className="font-medium" style={{ color: COLORS.text }}>{currentScenario.coverageLabel}</span>
          </div>
          <div className="h-3 w-px" style={{ backgroundColor: COLORS.border }} />
          <div className="flex items-center gap-2 text-[11px]">
            <span className="uppercase tracking-wider font-semibold" style={{ color: COLORS.muted, letterSpacing: "0.08em" }}>
              Fault:
            </span>
            <span className="font-medium" style={{ color: COLORS.text }}>{currentScenario.faultLabel}</span>
          </div>
          <div className="h-3 w-px" style={{ backgroundColor: COLORS.border }} />
          <div className="flex items-center gap-2 text-[11px]" title="Policy-level deductible retrieved during validation.">
            <span className="uppercase tracking-wider font-semibold cursor-help" style={{ color: COLORS.muted, letterSpacing: "0.08em" }}>
              Deductible:
            </span>
            <span className="font-medium tabular-nums" style={{ color: COLORS.text }}>{currentScenario.deductibleLabel}</span>
          </div>
        </div>
      )}

      {currentScenario.state === "SENIOR_AUTHORIZATION" && (
        <div
          className="flex items-start gap-2 px-6 py-2 border-b text-[12px]"
          style={{
            backgroundColor: "#FEF2F2",
            borderLeft: `3px solid #DC2626`,
            borderColor: "#FECACA",
            color: "#991B1B",
          }}
        >
          <span className="shrink-1 leading-relaxed">
            High-value repair estimate. Senior authorization is required before repair approval can be issued.
          </span>
        </div>
      )}


      {/* Header */}

      <header
        className="flex items-center justify-between gap-4 px-6 h-16 border-b shrink-0"
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
      >
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onReset}
            className="text-xs font-medium hover:underline underline-offset-2 shrink-0"
            style={{ color: COLORS.muted }}
          >
            ← Start New Claim
          </button>
          <div className="h-6 w-px shrink-0" style={{ backgroundColor: COLORS.border }} />
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="inline-block w-2 h-2 rounded-sm shrink-0"
              style={{ backgroundColor: COLORS.blue }}
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold tracking-tight truncate">
                Reviewing Claim for: {claimForm?.fullName?.trim() || "—"}
              </div>
              <div className="text-[11px] truncate" style={{ color: COLORS.muted }}>
                Policy: {claimForm?.policyNumber?.trim() || "—"}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-medium" style={{ color: COLORS.muted }}>
            Demo Claim
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setScenarioOpen((v) => !v)}
              onBlur={() => setTimeout(() => setScenarioOpen(false), 120)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[260px]"
              style={{
                backgroundColor: COLORS.surface,
                color: COLORS.text,
                borderColor: "#D1D5DB",
              }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: STATE_DOT[currentScenario.state] }}
              />
              <span className="font-medium truncate">{currentScenario.label}</span>
              <span className="ml-auto text-xs" style={{ color: COLORS.muted }}>▾</span>
            </button>
            {scenarioOpen && (
              <div
                className="absolute right-0 mt-1 w-[340px] rounded-md border shadow-lg z-20 overflow-hidden animate-fade-in"
                style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
              >
                {SCENARIOS.map((s) => {
                  const active = s.id === selectedId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedId(s.id);
                        setScenarioOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 flex items-start gap-3 border-b last:border-b-0 hover:bg-slate-50 transition-colors"
                      style={{
                        borderColor: COLORS.border,
                        backgroundColor: active ? "#F1F5F9" : "transparent",
                      }}
                    >
                      <span
                        className="inline-block w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: STATE_DOT[s.state] }}
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-medium" style={{ color: COLORS.text }}>
                          {s.label}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: COLORS.muted }}>
                          {s.description}
                        </div>
                        {s.subtext && (
                          <div className="text-[11px] mt-0.5 italic" style={{ color: COLORS.muted }}>
                            {s.subtext}
                          </div>
                        )}
                        <div className="text-[10px] mt-1.5 flex flex-wrap gap-x-2 gap-y-1" style={{ color: COLORS.muted }}>
                          <span><span className="uppercase tracking-wider" style={{ letterSpacing: "0.06em" }}>Policy:</span> <span style={{ color: COLORS.text }}>{s.coverageLabel}</span></span>
                          <span>·</span>
                          <span><span className="uppercase tracking-wider" style={{ letterSpacing: "0.06em" }}>Fault:</span> <span style={{ color: COLORS.text }}>{s.faultLabel}</span></span>
                          <span>·</span>
                          <span><span className="uppercase tracking-wider" style={{ letterSpacing: "0.06em" }}>Est:</span> <span className="tabular-nums" style={{ color: COLORS.text }}>{s.estimateRange}</span></span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Escalation banner */}
      <div key={workflowState + "-banner"} className="animate-fade-in">
        {workflowState === "SENIOR_AUTHORIZATION" ? (
          <div
            className="flex items-start gap-3 px-6 py-3 border-b shrink-0"
            style={{
              backgroundColor: "#FEF2F2",
              borderColor: "#FECACA",
              color: "#991B1B",
            }}
          >
            <Clock size={16} className="mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-semibold">Senior Authorization Required</div>
              <div className="text-xs mt-0.5" style={{ color: "#B91C1C" }}>
                Estimated repair value exceeds standard adjuster approval threshold. Senior adjuster review is required before authorization.
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
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold">Verification Recommended</div>
                <div className="text-xs mt-0.5" style={{ color: "#92400E" }}>
                  Possible structural damage detected. Please verify before approval.
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {(authorization || seniorPending) && (
        <div className="flex-1 min-h-0 overflow-auto p-6 animate-fade-in">
          {authorization ? (
            <ClaimAuthorizedScreen
              claimRef={claimRef}
              claimForm={effectiveClaimForm}
              authorization={authorization}
              adjusterName={ADJUSTER_NAME}
              onDownload={() => generateReportRef.current?.(true)}
              onReturnToQueue={() => {
                toast("Returning to claims queue…");
                setTimeout(() => onReset(), 600);
              }}
              onStartNewClaim={onReset}
            />
          ) : (
            <PendingSeniorAuthorizationScreen
              claimRef={claimRef}
              onReturnToQueue={() => {
                toast("Returning to claims queue…");
                setTimeout(() => onReset(), 600);
              }}
              onViewEstimate={() => setSeniorPending(false)}
              onDownloadEstimate={() => generateReportRef.current?.(false)}
            />
          )}
        </div>
      )}

      <main
        key={claim.id}
        className="flex-1 min-h-0 grid grid-cols-[minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(420px,1.35fr)] gap-4 p-4 animate-fade-in"
        style={
          authorization || seniorPending
            ? { display: "none" }
            : undefined
        }
      >
        {/* Damage Photo */}
        <Panel title="Damage Photo">
          <DamagePhotoPanel
            claim={claim}
            highlightedPart={highlightedPart}
            onHighlight={(idx) =>
              setHighlightedPart((cur) => (cur === idx ? null : idx))
            }
          />
        </Panel>

        {/* Center: Assessment Review */}
        <Panel title="Assessment Review">
          <AssessmentReviewPanel
            claim={claim}
            concernsDismissed={concernsDismissed}
            onDismissConcerns={() => setConcernsDismissed(true)}
          />
        </Panel>

        {/* Right: Estimate Review */}
        <Panel title="Estimate Review">
          <EstimateReviewPanel
            key={claim.id}
            claim={claim}
            claimForm={effectiveClaimForm}
            uploadedPhotos={uploadedPhotos}
            claimRef={claimRef}
            adjusterName={ADJUSTER_NAME}
            isFastTrack={isFastTrack}
            seniorReview={seniorReview}
            onTriggerSeniorReview={() => setSeniorReview(true)}
            highlightedPart={highlightedPart}
            onHighlight={(idx) =>
              setHighlightedPart((cur) => (cur === idx ? null : idx))
            }
            concernsDismissed={concernsDismissed}
            hasConcerns={(claim.verificationConcerns?.length ?? 0) > 0}
            authorization={authorization}
            seniorPending={seniorPending}
            onAuthorize={(details) => setAuthorization(details)}
            onSeniorSubmit={() => setSeniorPending(true)}
            generateReportRef={generateReportRef}
          />
        </Panel>
      </main>

      <DemoGuide />
    </div>
  );
}

function ClaimAuthorizedScreen({
  claimRef,
  claimForm,
  authorization,
  adjusterName,
  onDownload,
  onReturnToQueue,
  onStartNewClaim,
}: {
  claimRef: string;
  claimForm: ClaimForm | null;
  authorization: AuthorizationDetails;
  adjusterName: string;
  onDownload: () => void;
  onReturnToQueue: () => void;
  onStartNewClaim: () => void;
}) {
  const vehicle =
    [claimForm?.year, claimForm?.make, claimForm?.model].filter(Boolean).join(" ").trim() || "—";
  const policyholder = claimForm?.fullName?.trim() || "—";
  const dateLabel = new Date(authorization.authorizedAt).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const Row = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
    <div
      className="flex items-start justify-between gap-4 py-2.5 border-b"
      style={{ borderColor: COLORS.border }}
    >
      <span className="text-sm" style={{ color: COLORS.muted }}>{label}</span>
      <span
        className={`text-sm font-medium text-right ${mono ? "tabular-nums" : ""}`}
        style={{ color: COLORS.text }}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="rounded-lg border p-8"
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
      >
        <div className="flex flex-col items-center text-center">
          <CheckCircle size={48} strokeWidth={1.5} style={{ color: COLORS.green }} />
          <h2 className="mt-4 text-xl font-semibold" style={{ color: COLORS.text }}>
            Claim Authorized
          </h2>
          <p className="mt-1 text-sm" style={{ color: COLORS.muted }}>
            Repair authorization issued for Claim #{claimRef}
          </p>
          <div
            className="mt-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider"
            style={{ backgroundColor: COLORS.greenBg, color: COLORS.greenText }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: COLORS.green }}
            />
            Authorized
          </div>
        </div>

        <div className="mt-6">
          <Row label="Policyholder" value={policyholder} />
          <Row label="Vehicle" value={vehicle} />
          <Row label="Authorized Amount" value={fmtCurrency(authorization.amount)} mono />
          <Row
            label="Deductible"
            value={
              authorization.hasDeductible
                ? fmtCurrency(authorization.deductibleAmount)
                : "No deductible"
            }
            mono
          />
          <Row label="Repair Status" value="Authorized for Repair" />
          <Row label="Authorization Date" value={dateLabel} />
          <Row label="Authorized By" value={adjusterName} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: COLORS.blue }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.blueHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.blue)}
        >
          <FileText size={14} />
          Download Authorization Report
        </button>
        <button
          type="button"
          onClick={onReturnToQueue}
          className="rounded-md border px-4 py-2 text-sm font-medium"
          style={{ borderColor: COLORS.blue, color: COLORS.blue, backgroundColor: "white" }}
        >
          Return to Claims Queue
        </button>
        <button
          type="button"
          onClick={onStartNewClaim}
          className="rounded-md px-3 py-2 text-xs font-medium underline-offset-2 hover:underline"
          style={{ color: COLORS.muted }}
        >
          Start New Claim (demo)
        </button>
      </div>
    </div>
  );
}

function PendingSeniorAuthorizationScreen({
  claimRef,
  onReturnToQueue,
  onViewEstimate,
  onDownloadEstimate,
}: {
  claimRef: string;
  onReturnToQueue: () => void;
  onViewEstimate: () => void;
  onDownloadEstimate: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="rounded-lg border p-8 text-center"
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
      >
        <div className="flex justify-center">
          <Clock size={48} strokeWidth={1.5} style={{ color: COLORS.amber }} />
        </div>
        <h2 className="mt-4 text-xl font-semibold" style={{ color: COLORS.text }}>
          Pending Senior Authorization
        </h2>
        <p className="mt-1 text-sm" style={{ color: COLORS.muted }}>
          Claim #{claimRef} has been submitted for senior adjuster review.
        </p>
        <p className="mt-4 text-sm leading-relaxed" style={{ color: COLORS.muted }}>
          The estimate has been submitted for final authorization review.
        </p>
        <div
          className="mt-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider"
          style={{ backgroundColor: COLORS.amberBg, color: COLORS.amberText }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: COLORS.amber }}
          />
          Pending Senior Approval
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReturnToQueue}
          className="rounded-md border px-4 py-2 text-sm font-semibold"
          style={{ borderColor: COLORS.blue, color: COLORS.blue, backgroundColor: "white" }}
        >
          Return to Claims Queue
        </button>
        <button
          type="button"
          onClick={onViewEstimate}
          className="rounded-md border px-4 py-2 text-sm font-medium"
          style={{ borderColor: COLORS.border, color: COLORS.text, backgroundColor: "white" }}
        >
          View Submitted Estimate
        </button>
        <button
          type="button"
          onClick={onDownloadEstimate}
          className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium"
          style={{ borderColor: COLORS.border, color: COLORS.text, backgroundColor: "white", border: `1px solid ${COLORS.border}` }}
        >
          <FileText size={14} />
          Download Estimate Report
        </button>
      </div>
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
          <ul className="px-4 py-3 flex flex-col gap-2 text-xs" style={{ color: COLORS.text }}>
            <li className="flex gap-2">
              <span style={{ color: COLORS.muted }}>←</span>
              <span>Select Fast-Track Approval to view streamlined claim authorization</span>
            </li>
            <li className="flex gap-2">
              <span style={{ color: COLORS.muted }}>←</span>
              <span>Select Verification Required to view verification recommended steps</span>
            </li>
            <li className="flex gap-2">
              <span style={{ color: COLORS.muted }}>←</span>
              <span>Select Senior Authorization Required to view how higher-risk claims require additional review and authorization oversight</span>
            </li>
          </ul>
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

function AssessmentReviewPanel({
  claim,
  concernsDismissed,
  onDismissConcerns,
}: {
  claim: Claim;
  concernsDismissed: boolean;
  onDismissConcerns: () => void;
}) {
  const isFastTrack = claim.delegationState === "FAST_TRACK";
  const isSenior = claim.delegationState === "SENIOR_AUTHORIZATION";

  type BadgeIcon = "alert" | "clock" | null;
  const badgeMeta: { bg: string; fg: string; border: string; dot: string; label: string; icon: BadgeIcon } = isFastTrack
    ? { bg: COLORS.greenBg, fg: COLORS.greenText, border: "#BBF7D0", dot: COLORS.green, label: "Fast-Track Eligible", icon: null }
    : isSenior
      ? { bg: "#FEF2F2", fg: "#991B1B", border: "#FECACA", dot: "#DC2626", label: "Senior Authorization Required", icon: "clock" }
      : { bg: COLORS.amberBg, fg: COLORS.amberText, border: COLORS.amberBorder, dot: COLORS.amber, label: "Verification Recommended", icon: "alert" };

  const tooltipText = isFastTrack
    ? "Routed to Fast-Track: high photo clarity, single part affected, estimated value within standard threshold, no flagged components."
    : isSenior
      ? "Routed to Senior Authorization: estimated value ($8,400) exceeds standard authorization threshold, multiple flagged components, structural integrity cannot be confirmed from photo evidence alone."
      : "Routed to Verification Recommended: low resolution detected on rear quarter panel, frame rail damage cannot be confirmed from available angles, labor estimate range too wide to auto-authorize.";

  const routingBasis = isFastTrack
    ? [
        ["Photo quality", "High"],
        ["Financial exposure", "Standard ($330)"],
        ["Damage complexity", "Single part, cosmetic"],
      ]
    : isSenior
      ? [
          ["Photo quality", "Moderate"],
          ["Financial exposure", "Exceeds threshold ($8,400+)"],
          ["Damage complexity", "Multi-panel, structural involvement suspected"],
        ]
      : [
          ["Photo quality", "Low — rear panel unclear"],
          ["Financial exposure", "Elevated ($1,240–$2,100)"],
          ["Damage complexity", "Multi-part, possible structural"],
        ];

  const routingTone = isFastTrack
    ? { border: COLORS.green, bg: "#F0FDF4" }
    : isSenior
      ? { border: "#DC2626", bg: "#FEF2F2" }
      : { border: COLORS.amber, bg: "#FFFBEB" };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Delegation Status Badge with routing tooltip */}
      <div className="relative self-start group">
        <div
          className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold cursor-help"
          style={{
            backgroundColor: badgeMeta.bg,
            color: badgeMeta.fg,
            border: `1px solid ${badgeMeta.border}`,
          }}
        >
          {badgeMeta.icon === "alert" ? (
            <AlertTriangle size={14} />
          ) : badgeMeta.icon === "clock" ? (
            <Clock size={14} />
          ) : (
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: badgeMeta.dot }} />
          )}
          {badgeMeta.label}
          <span
            className="ml-0.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-bold border"
            style={{ borderColor: badgeMeta.fg, color: badgeMeta.fg }}
            aria-label="Routing explanation"
          >
            i
          </span>
        </div>
        <div
          role="tooltip"
          className="pointer-events-none absolute left-0 top-full mt-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 z-30"
          style={{ maxWidth: 280, width: 280 }}
        >
          <div
            className="rounded-md px-3 py-2 text-[12px] leading-snug shadow-md"
            style={{
              backgroundColor: "#FFFFFF",
              color: COLORS.muted,
              border: "0.5px solid " + COLORS.border,
            }}
          >
            {tooltipText}
          </div>
        </div>
      </div>

      {/* Senior review passive status */}
      {isSenior && (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#DC2626" }}>
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "#DC2626" }} />
            Senior authorization in progress
          </div>
          <div className="text-xs" style={{ color: COLORS.muted }}>
            Claim prepared for authorization review.
          </div>
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

        {/* Routing basis */}
        <div className="mt-3">
          <div
            className="text-[11px] font-semibold uppercase mb-1.5"
            style={{ color: COLORS.muted, letterSpacing: "0.08em" }}
          >
            Routing basis
          </div>
          <div
            className="rounded-sm"
            style={{
              backgroundColor: routingTone.bg,
              borderLeft: `2px solid ${routingTone.border}`,
              padding: "8px 12px",
            }}
          >
            <ul className="flex flex-col gap-1 text-[12px]" style={{ color: COLORS.muted }}>
              {routingBasis.map(([k, v]) => (
                <li key={k} className="flex items-start gap-1.5">
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: routingTone.border }} />
                  <span>
                    <span style={{ color: COLORS.text }}>{k}:</span> {v}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${isFastTrack ? "#BBF7D0" : COLORS.border}` }}>
          {isFastTrack ? (
            <p className="text-sm" style={{ color: COLORS.muted }}>
              No additional review triggers detected.
            </p>
          ) : concernsDismissed ? (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: COLORS.muted }}>
              <CheckCircle size={12} />
              Verification concerns noted by adjuster.
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium" style={{ color: COLORS.amberText }}>
                Review before approving:
              </p>
              {claim.verificationConcerns?.map((concern, i) => (
                <div key={i} className="flex items-start gap-2 text-sm" style={{ color: "#374151" }}>
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: COLORS.amber }} />
                  {concern}
                </div>
              ))}
              <button
                type="button"
                onClick={onDismissConcerns}
                className="self-start text-xs font-medium underline-offset-2 hover:underline mt-1"
                style={{ color: COLORS.blue }}
              >
                Noted — proceed
              </button>
            </div>
          )}
        </div>
      </div>


      {/* Recommended Reviewer — VERIFICATION_RECOMMENDED only */}
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

function DamagePhotoPanel({
  claim,
  highlightedPart,
  onHighlight,
}: {
  claim: Claim;
  highlightedPart: number | null;
  onHighlight: (partIndex: number) => void;
}) {
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
        {claim.imageUrl ? (
          <img
            src={claim.imageUrl}
            alt={claim.imagePlaceholder}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="text-center px-4">
            <div className="font-medium text-sm" style={{ color: "#475569" }}>
              {claim.imagePlaceholder}
            </div>
            <div className="text-xs mt-1" style={{ color: "#94A3B8" }}>
              Claim {claim.id}
            </div>
          </div>
        )}


        {(OVERLAYS[claim.id] ?? []).map((ov, i) => {
          const colors = OVERLAY_COLORS[ov.severity];
          const active = highlightedPart === ov.partIndex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onHighlight(ov.partIndex)}
              className="absolute text-left rounded-md transition-all duration-200 focus:outline-none"
              style={{
                left: `${ov.x}%`,
                top: `${ov.y}%`,
                width: `${ov.w}%`,
                height: `${ov.h}%`,
                backgroundColor: colors.fill,
                border: `2px ${ov.dashed ? "dashed" : "solid"} ${colors.border}`,
                boxShadow: active
                  ? `0 0 0 2px #FFF, 0 0 0 4px ${colors.border}, 0 4px 12px rgba(0,0,0,0.15)`
                  : "0 1px 3px rgba(0,0,0,0.12)",
                transform: active ? "scale(1.02)" : "scale(1)",
                zIndex: active ? 5 : 1,
              }}
              aria-label={`${ov.label} — ${ov.sub}`}
            >
              <div
                className="absolute -top-2 left-2 inline-flex flex-col rounded-md shadow-sm"
                style={{
                  backgroundColor: colors.pillBg,
                  border: `1px solid ${colors.border}`,
                  maxWidth: "calc(100% - 8px)",
                }}
              >
                <span
                  className="px-2 py-0.5 text-[10px] font-semibold leading-tight"
                  style={{ color: colors.pillFg }}
                >
                  {ov.label}
                </span>
                {active && (
                  <span
                    className="px-2 pb-1 text-[10px] leading-tight animate-fade-in"
                    style={{ color: colors.pillFg }}
                  >
                    {ov.sub}
                  </span>
                )}
              </div>
            </button>
          );
        })}
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

const SOURCE_META: Record<
  SourceKey,
  { short: string; label: string; bg: string; fg: string; border: string }
> = {
  mitchell: {
    short: "Mitchell",
    label: "Mitchell RepairCenter",
    bg: "#EFF6FF",
    fg: "#1D4ED8",
    border: "#BFDBFE",
  },
  ccc: {
    short: "CCC",
    label: "CCC Intelligent Solutions",
    bg: "#F5F3FF",
    fg: "#6D28D9",
    border: "#DDD6FE",
  },
  oem: {
    short: "OEM",
    label: "OEM Repair Guidelines",
    bg: "#F3F4F6",
    fg: "#374151",
    border: "#E5E7EB",
  },
  verify: {
    short: "Verify",
    label: "Verification Required",
    bg: COLORS.amberBg,
    fg: COLORS.amberText,
    border: COLORS.amberBorder,
  },
};

function CostBreakdownPanel({
  part,
  onClose,
}: {
  part: Claim["parts"][number];
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (panelRef.current?.contains(target)) return;
      if (target.closest("[data-line-item-toggle]")) return;
      onClose();
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [onClose]);

  const hasCCC = part.sources.includes("ccc");
  const hasOEM = part.sources.includes("oem");
  const hasMitchell = part.sources.includes("mitchell");
  const hasVerify = part.sources.includes("verify");

  const scope = part.suggestedRepairScope.toLowerCase();
  const isReplace = scope.includes("replace");
  const isInspectOnly = scope === "inspect";
  const isRepair = !isReplace && !isInspectOnly;

  const labour = part.laborHours * 95;
  const total = part.draftEstimate;

  type Row = { label: string; value: string };
  const rows: Row[] = [
    {
      label: "Labour",
      value: `${part.laborHours} hrs × $95/hr = ${fmtCurrency(labour)}`,
    },
  ];

  let accountedForParts = 0;
  if (isRepair) {
    const paint = Math.round(part.partsPrice * 0.65 * 100) / 100;
    const materials = Math.round((part.partsPrice - paint) * 100) / 100;
    if (paint > 0) rows.push({ label: "Paint/refinish", value: fmtCurrency(paint) });
    if (materials > 0) rows.push({ label: "Materials", value: fmtCurrency(materials) });
    accountedForParts = paint + materials;
  } else if (isReplace) {
    const partLabel = hasOEM && !hasCCC ? "Part cost (OEM)" : "Part cost (aftermarket)";
    rows.push({ label: partLabel, value: fmtCurrency(part.partsPrice) });
    accountedForParts = part.partsPrice;
  } else {
    rows.push({ label: "Inspection fee", value: fmtCurrency(part.partsPrice) });
    accountedForParts = part.partsPrice;
  }

  const regional = Math.round((total - labour - accountedForParts) * 100) / 100;
  if (Math.abs(regional) >= 0.01) {
    rows.push({
      label: "Regional adjustment",
      value: `${regional < 0 ? "−" : ""}${fmtCurrency(Math.abs(regional))}`,
    });
  }

  const sourceReferences: string[] = [];
  if (hasMitchell) sourceReferences.push("Mitchell RepairCenter — labour benchmark");
  if (hasCCC) sourceReferences.push("CCC Intelligent Solutions — parts pricing");
  if (hasOEM) sourceReferences.push("OEM Repair Guidelines — repair procedure");
  if (hasVerify) sourceReferences.push("Internal Comparables Database — extrapolated reference");

  return (
    <div
      ref={panelRef}
      className="relative rounded-md border p-3 animate-fade-in"
      style={{ backgroundColor: "#FAFAFA", borderColor: COLORS.border }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close breakdown"
        className="absolute top-2 right-2 text-xs font-medium px-1.5 py-0.5 rounded hover:bg-black/5"
        style={{ color: COLORS.muted }}
      >
        Close ×
      </button>

      <div
        className="text-[11px] font-semibold uppercase tracking-wider mb-3"
        style={{ color: COLORS.text }}
      >
        Cost Breakdown
      </div>

      <div className="space-y-1 text-sm" style={{ color: COLORS.text }}>
        {rows.map((r, idx) => (
          <div key={idx} className="flex items-baseline justify-between">
            <span style={{ color: COLORS.muted }}>{r.label}:</span>
            <span className="tabular-nums">{r.value}</span>
          </div>
        ))}
      </div>

      <div
        className="flex items-baseline justify-between pt-2 mt-2 border-t"
        style={{ borderColor: "#111827", borderTopWidth: 1 }}
      >
        <span className="text-sm font-semibold" style={{ color: COLORS.text }}>
          Final line total
        </span>
        <span className="text-sm font-bold tabular-nums" style={{ color: COLORS.text }}>
          {fmtCurrency(total)}
        </span>
      </div>

      {isInspectOnly && (
        <p className="mt-2 text-[11px] italic" style={{ color: COLORS.muted }}>
          Estimate subject to physical inspection findings
        </p>
      )}

      {sourceReferences.length > 0 && (
        <div className="mt-3 pt-2 border-t" style={{ borderColor: COLORS.border }}>
          <div
            className="text-[11px] font-semibold uppercase tracking-wider mb-1"
            style={{ color: COLORS.muted }}
          >
            Source References
          </div>
          <ul className="space-y-0.5" style={{ color: COLORS.muted, fontSize: "11px" }}>
            {sourceReferences.map((ref, idx) => (
              <li key={idx}>• {ref}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}





function EstimateReviewPanel({
  claim,
  claimForm,
  uploadedPhotos,
  claimRef,
  adjusterName,
  isFastTrack,
  seniorReview,
  onTriggerSeniorReview,
  highlightedPart,
  onHighlight,
  concernsDismissed,
  hasConcerns,
  authorization,
  seniorPending,
  onAuthorize,
  onSeniorSubmit,
  generateReportRef,
}: {
  claim: Claim;
  claimForm: ClaimForm | null;
  uploadedPhotos: UploadedPhoto[];
  claimRef: string;
  adjusterName: string;
  isFastTrack: boolean;
  seniorReview: boolean;
  onTriggerSeniorReview: () => void;
  highlightedPart: number | null;
  onHighlight: (partIndex: number) => void;
  concernsDismissed: boolean;
  hasConcerns: boolean;
  authorization: AuthorizationDetails | null;
  seniorPending: boolean;
  onAuthorize: (details: AuthorizationDetails) => void;
  onSeniorSubmit: () => void;
  generateReportRef: React.MutableRefObject<((forAuthorization?: boolean) => Promise<void>) | null>;
}) {
  const [adjusted, setAdjusted] = useState<number[]>(() =>
    claim.parts.map((p) => p.draftEstimate),
  );
  const [drafts, setDrafts] = useState<string[]>(() =>
    claim.parts.map((p) => p.draftEstimate.toFixed(2)),
  );
  const [log, setLog] = useState<LogEntry[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const toggleExpanded = (row: number) =>
    setExpanded((prev) => (prev === row ? null : row));

  const NOTES_LIMIT = 500;
  const [adjusterNotes, setAdjusterNotes] = useState("");
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const [notesSavedVisible, setNotesSavedVisible] = useState(false);
  const notesSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notesHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (notesSaveTimer.current) clearTimeout(notesSaveTimer.current);
      if (notesHideTimer.current) clearTimeout(notesHideTimer.current);
    };
  }, []);
  const handleNotesChange = (value: string) => {
    const next = value.slice(0, NOTES_LIMIT);
    setAdjusterNotes(next);
    if (notesSaveTimer.current) clearTimeout(notesSaveTimer.current);
    if (notesHideTimer.current) clearTimeout(notesHideTimer.current);
    notesSaveTimer.current = setTimeout(() => {
      setNotesSavedVisible(true);
      notesHideTimer.current = setTimeout(() => setNotesSavedVisible(false), 2000);
    }, 700);
  };

  const [seniorConfirmOpen, setSeniorConfirmOpen] = useState(false);
  const [approvalConfirmOpen, setApprovalConfirmOpen] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);
  const [validationItems, setValidationItems] = useState<string[]>([]);
  const [pendingPrimaryMode, setPendingPrimaryMode] = useState<
    "FAST_TRACK" | "VERIFICATION_RECOMMENDED" | "SENIOR_AUTHORIZATION" | null
  >(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const seniorSubmitted = seniorPending;
  const isAuthorized = authorization !== null;

  // Request Information modal state
  const [requestInfoOpen, setRequestInfoOpen] = useState(false);
  const [requestItems, setRequestItems] = useState({
    police_report: false,
    additional_photos: false,
    supporting_docs: false,
    customer_clarification: false,
  });
  const [requestMessage, setRequestMessage] = useState("");
  const resetRequestInfo = () => {
    setRequestItems({
      police_report: false,
      additional_photos: false,
      supporting_docs: false,
      customer_clarification: false,
    });
    setRequestMessage("");
  };
  const anyRequestItemSelected = Object.values(requestItems).some(Boolean);

  // Rationale tracking for adjuster overrides
  type RationaleCode =
    | "additional_damage"
    | "labor_rate"
    | "scope_change"
    | "parts_availability"
    | "other";
  type Override = { reason: RationaleCode | null; other: string };
  const [overrides, setOverrides] = useState<Record<number, Override>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isOverrideConfirmed = (o: Override | undefined) =>
    !!o && o.reason !== null && (o.reason !== "other" || o.other.trim().length > 0);
  const isOverridePending = (i: number) => {
    const o = overrides[i];
    if (!o) return false;
    if (adjusted[i] === claim.parts[i].draftEstimate) return false;
    return !isOverrideConfirmed(o);
  };
  const pendingOverrideRows = claim.parts
    .map((_, i) => i)
    .filter((i) => isOverridePending(i));
  const hasPendingOverrides = pendingOverrideRows.length > 0;

  const setOverrideReason = (i: number, reason: RationaleCode) => {
    setOverrides((prev) => {
      const next = { ...prev };
      const existing = next[i] ?? { reason: null, other: "" };
      next[i] = { ...existing, reason };
      return next;
    });
    setSubmitError(null);
  };
  const setOverrideOther = (i: number, other: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      const existing = next[i] ?? { reason: "other" as RationaleCode, other: "" };
      next[i] = { ...existing, other: other.slice(0, 140) };
      return next;
    });
  };




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





  const getDraftValues = () =>
    drafts.map((raw, i) => {
      const parsed = parseFloat(raw);
      return Number.isFinite(parsed) ? parsed : adjusted[i];
    });

  const syncDraftValues = () => {
    const nextAdjusted = getDraftValues();
    setAdjusted(nextAdjusted);
    setDrafts(nextAdjusted.map((value) => value.toFixed(2)));
    return nextAdjusted;
  };

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

    // Rationale tracking: if value diverges from draft, require a reason.
    const draftVal = claim.parts[i].draftEstimate;
    setOverrides((prev) => {
      const next = { ...prev };
      if (parsed === draftVal) {
        delete next[i];
      } else {
        // Reset to unconfirmed whenever the value changes.
        next[i] = { reason: null, other: "" };
      }
      return next;
    });
    setSubmitError(null);
  };


  const generateReport = async (forAuthorization: boolean = isAuthorized) => {
    const reportAdjusted = syncDraftValues();
    const reportTotal = reportAdjusted.reduce((s, n) => s + (isFinite(n) ? n : 0), 0);
    const fileName = forAuthorization
      ? `Claim_${claim.id}_Authorization.pdf`
      : `Claim_${claim.id}_Assessment.pdf`;

    const workflowState: "FAST_TRACK" | "VERIFICATION_RECOMMENDED" | "SENIOR_AUTHORIZATION" =
      seniorReview || claim.delegationState === "SENIOR_AUTHORIZATION"
        ? "SENIOR_AUTHORIZATION"
        : claim.delegationState;
    const stateLabel = {
      FAST_TRACK: "Fast-Track",
      VERIFICATION_RECOMMENDED: "Verification Recommended",
      SENIOR_AUTHORIZATION: "Senior Authorization",
    }[workflowState];
    const stateBadge = {
      FAST_TRACK: { bg: "#DCFCE7", fg: "#15803D" },
      VERIFICATION_RECOMMENDED: { bg: "#FEF3C7", fg: "#B45309" },
      SENIOR_AUTHORIZATION: { bg: "#FEE2E2", fg: "#B91C1C" },
    }[workflowState];

    setIsGeneratingReport(true);
    const tid = toast.loading("Generating claim summary report…");

    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const M = 40;
      const W = pageW - M * 2;
      let y = M;

      const need = (h: number) => {
        if (y + h > pageH - M - 30) {
          pdf.addPage();
          y = M;
        }
      };
      const formatLossDate = (s: string | undefined): string => {
        if (!s || !s.trim()) return "—";
        const d = new Date(s);
        if (isNaN(d.getTime())) return s;
        return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      };
      const setText = (size: number, color = "#111827", bold = false, italic = false) => {
        const style = bold ? (italic ? "bolditalic" : "bold") : italic ? "italic" : "normal";
        pdf.setFont("helvetica", style);
        pdf.setFontSize(size);
        pdf.setTextColor(color);
      };
      const wrapped = (
        t: string,
        x: number,
        maxW: number,
        size = 13,
        color = "#374151",
        bold = false,
        italic = false,
      ) => {
        setText(size, color, bold, italic);
        const lh = size * 1.35;
        const lines = pdf.splitTextToSize(t, maxW) as string[];
        lines.forEach((ln) => {
          need(lh);
          pdf.text(ln, x, y + size);
          y += lh;
        });
      };
      const sectionLabel = (label: string) => {
        need(34);
        y += 16;
        setText(11, "#111827", true);
        pdf.text(label.toUpperCase(), M, y + 8);
        y += 18;
      };
      const drawBadge = (
        text: string,
        x: number,
        yCenter: number,
        bg: string,
        fg: string,
        border?: string,
      ) => {
        setText(11, fg, true);
        const tw = pdf.getTextWidth(text);
        const bw = tw + 12;
        const bh = 16;
        const by = yCenter - bh / 2;
        pdf.setFillColor(bg);
        if (border) {
          pdf.setDrawColor(border);
          pdf.setLineWidth(0.5);
          pdf.roundedRect(x, by, bw, bh, 3, 3, "FD");
        } else {
          pdf.roundedRect(x, by, bw, bh, 3, 3, "F");
        }
        pdf.setTextColor(fg);
        pdf.text(text, x + 6, by + 11);
        return bw;
      };
      const dateStr = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // ===== HEADER =====
      setText(18, "#111827");
      // weight 500 ~ normal
      pdf.text("Claim Assessment Report", M, y + 14);
      // right badge
      setText(11, stateBadge.fg, true);
      const btw = pdf.getTextWidth(stateLabel);
      const bbw = btw + 18;
      pdf.setFillColor(stateBadge.bg);
      pdf.roundedRect(pageW - M - bbw, y + 2, bbw, 20, 4, 4, "F");
      pdf.setTextColor(stateBadge.fg);
      pdf.text(stateLabel, pageW - M - bbw + 9, y + 16);
      y += 26;
      setText(13, "#6B7280");
      pdf.text(`Claim #${claim.id} · ${claim.type} · ${dateStr}`, M, y + 10);
      y += 22;
      pdf.setDrawColor("#111827");
      pdf.setLineWidth(1.5);
      pdf.line(M, y, pageW - M, y);
      y += 4;

      // ===== SECTION 1 — REVIEW SUMMARY =====
      sectionLabel("Review Summary");
      const cardGap = 8;
      const cardW = (W - 4 * cardGap) / 5;
      const cardH = 60;
      const cf2 = claimForm;
      const dedEntered = cf2?.deductible?.trim();
      const deductibleValue =
        cf2?.fault === "policyholder"
          ? (dedEntered ? `$${dedEntered}` : "N/A")
          : cf2?.fault === "other"
            ? "N/A"
            : "—";

      const stats = [
        { label: "Review type", value: stateLabel, color: "#111827" },
        {
          label: "Assessment confidence",
          value: claim.reviewConfidence,
          color: claim.reviewConfidence === "Low" ? "#B45309" : "#111827",
        },
        {
          label: "Risk level",
          value: claim.riskLevel.charAt(0) + claim.riskLevel.slice(1).toLowerCase(),
          color: claim.riskLevel === "HIGH" ? "#B91C1C" : "#111827",
        },
        { label: "Draft total", value: fmtCurrency(draftTotal), color: "#111827" },
        { label: "Deductible", value: deductibleValue, color: "#111827" },
      ];
      need(cardH + 8);
      stats.forEach((s, i) => {
        const x = M + i * (cardW + cardGap);
        pdf.setFillColor("#F3F4F6");
        pdf.roundedRect(x, y, cardW, cardH, 4, 4, "F");
        setText(10, "#6B7280", false);
        pdf.text(s.label.toUpperCase(), x + 10, y + 18);
        setText(13, s.color, true);
        pdf.text(s.value, x + 10, y + 44);
      });
      y += cardH + 12;


      if (workflowState === "SENIOR_AUTHORIZATION") {
        const alertH = 52;
        need(alertH + 8);
        pdf.setFillColor("#FEF2F2");
        pdf.rect(M, y, W, alertH, "F");
        pdf.setFillColor("#DC2626");
        pdf.rect(M, y, 3, alertH, "F");
        setText(13, "#991B1B", true);
        pdf.text("Senior authorization required", M + 14, y + 18);
        setText(11, "#7F1D1D");
        const msg =
          "This claim must be reviewed and signed off by a senior adjuster before any repair authorization can be issued.";
        const lines = pdf.splitTextToSize(msg, W - 28) as string[];
        lines.forEach((ln, idx) => pdf.text(ln, M + 14, y + 32 + idx * 12));
        y += alertH + 12;
      }

      // ===== SECTION 2 — POLICYHOLDER & VEHICLE =====
      sectionLabel("Policyholder & Vehicle");
      const cf = claimForm;
      const labelX = M;
      const valX = M + 180;
      const infoRows: [string, string][] = [
        ["Policyholder name", cf?.fullName?.trim() || "—"],
        ["Policy number", cf?.policyNumber?.trim() || "—"],
        [
          "Vehicle",
          cf ? [cf.year, cf.make, cf.model].filter(Boolean).join(" ").trim() || "—" : "—",
        ],
        [
          "Incident type",
          cf
            ? (cf.incidentType === "Other" ? cf.incidentTypeOther : cf.incidentType) ||
              claim.type
            : claim.type,
        ],
        ["Date of loss", formatLossDate(cf?.dateOfLoss)],
      ];
      infoRows.forEach(([label, val]) => {
        need(24);
        setText(11, "#6B7280");
        pdf.text(label, labelX, y + 14);
        setText(13, "#111827");
        pdf.text(val, valX, y + 14);
        y += 22;
        pdf.setDrawColor("#F3F4F6");
        pdf.setLineWidth(0.5);
        pdf.line(M, y, pageW - M, y);
      });
      // ===== SECTION — UPLOADED DAMAGE PHOTOS =====
      sectionLabel("Uploaded Damage Photos");

      // Load uploaded photo blob URLs into data URLs for embedding
      const toDataUrl = (url: string): Promise<{ data: string; w: number; h: number } | null> =>
        new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
              const ctx = canvas.getContext("2d");
              if (!ctx) return resolve(null);
              ctx.drawImage(img, 0, 0);
              resolve({
                data: canvas.toDataURL("image/jpeg", 0.85),
                w: img.naturalWidth,
                h: img.naturalHeight,
              });
            } catch {
              resolve(null);
            }
          };
          img.onerror = () => resolve(null);
          img.src = url;
        });

      const photoData = await Promise.all(uploadedPhotos.map((p) => toDataUrl(p.url)));

      if (uploadedPhotos.length === 0) {
        setText(12, "#6B7280", false, true);
        pdf.text("No photos were uploaded for this claim.", M, y + 14);
        y += 24;
      } else {
        const photoGap = 12;
        const photosPerRow = 3;
        const photoW = (W - photoGap * (photosPerRow - 1)) / photosPerRow;
        const photoH = photoW * 0.72;
        const captionH = 44;
        const blockH = photoH + captionH + 6;

        for (let i = 0; i < uploadedPhotos.length; i++) {
          const col = i % photosPerRow;
          if (col === 0) need(blockH + 6);
          const px = M + col * (photoW + photoGap);
          const py = y;
          // frame
          pdf.setFillColor("#F9FAFB");
          pdf.setDrawColor("#E5E7EB");
          pdf.setLineWidth(0.5);
          pdf.roundedRect(px, py, photoW, photoH, 3, 3, "FD");
          const pd = photoData[i];
          if (pd) {
            // contain image inside frame
            const ratio = Math.min(photoW / pd.w, photoH / pd.h);
            const iw = pd.w * ratio;
            const ih = pd.h * ratio;
            const ix = px + (photoW - iw) / 2;
            const iy = py + (photoH - ih) / 2;
            try {
              pdf.addImage(pd.data, "JPEG", ix, iy, iw, ih);
            } catch {
              setText(9, "#9CA3AF");
              pdf.text("Image unavailable", px + photoW / 2, py + photoH / 2, { align: "center" });
            }
          } else {
            setText(9, "#9CA3AF");
            pdf.text("Image unavailable", px + photoW / 2, py + photoH / 2, { align: "center" });
          }

          // caption
          const cap = uploadedPhotos[i];
          const ts = new Date(cap.uploadedAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          });
          setText(10, "#111827", true);
          pdf.text(cap.name, px, py + photoH + 12);
          setText(9, "#6B7280");
          pdf.text(ts, px, py + photoH + 24);
          // accepted pill
          drawBadge("Accepted", px, py + photoH + 36, "#DCFCE7", "#15803D");

          if (col === photosPerRow - 1 || i === uploadedPhotos.length - 1) {
            y += blockH;
          }
        }
        y += 8;
      }

      // ===== SECTION 2b — COVERAGE SUMMARY =====
      sectionLabel("Coverage Summary");
      const cv = cf?.coverage;
      const ft = cf?.fault;
      const coverageTypeText = "Full Coverage Policy";
      const faultText =
        ft === "policyholder" ? "Policyholder at fault" :
        ft === "other" ? "Other party at fault" :
        ft === "unclear" ? "Fault disputed / unclear" :
        ft === "single_vehicle" ? "Single-vehicle incident" : "—";
      const dedVal = cf?.deductible?.trim();
      const deductibleApplicable =
        ft === "policyholder"
          ? (dedVal ? `$${dedVal} (retrieved from policy record)` : "N/A")
          : ft === "other"
            ? "N/A — handled by at-fault party"
            : "Pending";

      const claimBasis = "Own damage — full coverage";
      const covRows: [string, string][] = [
        ["Coverage type", coverageTypeText],
        ["Fault determination", faultText],
        ["Deductible applicable", deductibleApplicable],
        ["Claim basis", claimBasis],
      ];
      covRows.forEach(([label, val]) => {
        need(24);
        setText(11, "#6B7280");
        pdf.text(label, labelX, y + 14);
        setText(13, "#111827");
        const wrapped = pdf.splitTextToSize(val, pageW - M - valX) as string[];
        wrapped.forEach((ln, idx) => pdf.text(ln, valX, y + 14 + idx * 14));
        y += 22 + Math.max(0, (wrapped.length - 1) * 14);
        pdf.setDrawColor("#F3F4F6");
        pdf.setLineWidth(0.5);
        pdf.line(M, y, pageW - M, y);
      });
      void cv;
      // Deductible exceeds repair cost note
      {
        const dedNum = parseFloat((cf?.deductible || "").replace(/[^0-9.]/g, ""));
        if (
          isFinite(dedNum) &&
          dedNum > 0 &&
          dedNum > draftTotal &&
          draftTotal > 0
        ) {
          const noteLines = pdf.splitTextToSize(
            `Note: Deductible (${fmtCurrency(dedNum)}) exceeds draft repair estimate (${fmtCurrency(draftTotal)}). Policyholder may be responsible for full repair cost pending final assessment.`,
            W - 24,
          ) as string[];
          const noteH = noteLines.length * 13 + 12;
          need(noteH + 6);
          pdf.setFillColor("#F9FAFB");
          pdf.rect(M, y, W, noteH, "F");
          setText(10, "#6B7280", false, true);
          noteLines.forEach((ln, idx) => pdf.text(ln, M + 12, y + 14 + idx * 13));
          y += noteH + 4;
        }
      }
      y += 4;



      // ===== SECTION 3 — ESTIMATE BREAKDOWN =====
      // Page break if table would start too close to bottom
      if (y + 150 > pageH - M - 30) {
        pdf.addPage();
        y = M;
      }
      sectionLabel("Estimate Breakdown");
      // Proportional columns: Item 35%, Scope 10%, Labor 10%, Cost Basis 20%, Draft 12%, Adjusted 13%
      const colItem = M;                       // text left (35%)
      const colScope = M + Math.round(W * 0.35);   // text left (10%)
      const colLabor = M + Math.round(W * 0.45);   // text left (10%)
      const colBasis = M + Math.round(W * 0.55);   // badges left (20%)
      const colDraftR = M + Math.round(W * 0.87);  // right-aligned (12% column ending here)
      const colAdjR = pageW - M;                   // right-aligned (13%)
      const itemMaxW = Math.round(W * 0.35) - 6;
      const basisMaxW = Math.round(W * 0.20) - 6;
      need(24);
      setText(9, "#6B7280", true);
      pdf.text("LINE ITEM", colItem, y + 10);
      pdf.text("SCOPE", colScope, y + 10);
      pdf.text("LABOR", colLabor, y + 10);
      pdf.text("COST BASIS", colBasis, y + 10);
      pdf.text("DRAFT EST.", colDraftR, y + 10, { align: "right" });
      pdf.text("ADJUSTED EST.", colAdjR, y + 10, { align: "right" });
      y += 18;
      pdf.setDrawColor("#E5E7EB");
      pdf.setLineWidth(0.5);
      pdf.line(M, y, pageW - M, y);
      y += 6;

      const badgeColors: Record<SourceKey, { bg: string; fg: string; border?: string }> = {
        mitchell: { bg: "#EFF6FF", fg: "#1D4ED8" },
        ccc: { bg: "#F5F3FF", fg: "#6D28D9" },
        oem: { bg: "#FFFFFF", fg: "#374151", border: "#D1D5DB" },
        verify: { bg: "#FEF3C7", fg: "#B45309" },
      };

      claim.parts.forEach((part, i) => {
        const draftVal = part.draftEstimate;
        const adjVal = reportAdjusted[i];
        const hasVerify = part.sources.includes("verify");
        // name may wrap to multiple lines
        setText(10, "#111827");
        const nameLines = pdf.splitTextToSize(part.name, itemMaxW) as string[];
        const rowH = Math.max(24, nameLines.length * 14 + 8);
        need(rowH + 4);
        const rowY = y + 12;
        nameLines.forEach((ln, idx) => pdf.text(ln, colItem, rowY + idx * 14));
        setText(10, "#374151");
        const scopeLines = pdf.splitTextToSize(part.suggestedRepairScope, Math.round(W * 0.10) - 6) as string[];
        scopeLines.slice(0, 2).forEach((ln, idx) => pdf.text(ln, colScope, rowY + idx * 14));
        pdf.text(`${part.laborHours}h`, colLabor, rowY);
        let bx = colBasis;
        part.sources.forEach((src) => {
          const c = badgeColors[src];
          if (bx - colBasis > basisMaxW - 30) return;
          const bw = drawBadge(SOURCE_META[src].short, bx, rowY - 4, c.bg, c.fg, c.border);
          bx += bw + 3;
        });
        // Draft estimate — always original, never override
        setText(10, "#111827");
        pdf.text(fmtCurrency(draftVal), colDraftR, rowY, { align: "right" });
        // Adjusted estimate (right column)
        if (hasVerify) {
          const tri = colAdjR - pdf.getTextWidth(fmtCurrency(adjVal)) - 12;
          pdf.setFillColor("#F59E0B");
          pdf.triangle(tri, rowY - 1, tri + 8, rowY - 1, tri + 4, rowY - 8, "F");
          setText(10, "#B45309", true);
        } else if (adjVal !== draftVal) {
          setText(10, "#B45309", true);
        } else {
          setText(10, "#111827");
        }
        pdf.text(fmtCurrency(adjVal), colAdjR, rowY, { align: "right" });
        y += rowH;
        pdf.setDrawColor("#F3F4F6");
        pdf.setLineWidth(0.5);
        pdf.line(M, y, pageW - M, y);
      });


      // totals row
      need(36);
      pdf.setDrawColor("#111827");
      pdf.setLineWidth(1.5);
      pdf.line(M, y, pageW - M, y);
      y += 4;
      setText(13, "#111827", true);
      pdf.text("Total", M, y + 16);
      pdf.text(fmtCurrency(reportTotal), pageW - M, y + 16, { align: "right" });
      y += 24;
      wrapped(
        "Lines marked Verify are extrapolated from comparable claims and require senior adjuster confirmation before authorization.",
        M,
        W,
        11,
        "#6B7280",
      );

      // ===== SECTION 3b — PAYMENT SUMMARY =====
      sectionLabel("Payment Summary");
      {
        const cf2 = claimForm;
        const cv2 = cf2?.coverage;
        const ft2 = cf2?.fault;
        const dedStr2 = cf2?.deductible?.trim() ?? "";
        const dedNum2 = parseFloat(dedStr2.replace(/[^0-9.]/g, ""));
        const hasDeductible2 = ft2 === "policyholder";
        const deductibleAmount2 = hasDeductible2 && isFinite(dedNum2) && dedNum2 > 0 ? dedNum2 : 0;
        const coveragePayout2 = hasDeductible2 ? Math.max(0, reportTotal - deductibleAmount2) : reportTotal;
        const isFullyCovered2 = ft2 === "other" || (ft2 === "policyholder" && (!dedStr2 || dedNum2 <= 0));
        void cv2;

        const payRows: [string, string][] = [
          ["Repair Estimate Total", fmtCurrency(reportTotal)],
        ];
        if (ft2 === "other") {
          payRows.push(["Policy Deductible", "N/A — handled by at-fault party"]);
          payRows.push(["Coverage Status", "Fully Covered"]);
        } else if (isFullyCovered2) {
          payRows.push(["Policy Deductible", "$0"]);
          payRows.push(["Coverage Status", "Fully Covered"]);
        } else if (hasDeductible2) {
          payRows.push(["Policy Deductible", `−${fmtCurrency(deductibleAmount2)}`]);
          payRows.push(["Estimated Insurance Coverage", fmtCurrency(coveragePayout2)]);
        } else {
          payRows.push(["Policy Deductible", "Pending"]);
        }

        payRows.forEach(([label, val]) => {
          need(24);
          setText(11, "#6B7280");
          pdf.text(label, labelX, y + 14);
          setText(13, "#111827", true);
          pdf.text(val, valX, y + 14);
          y += 22;
          pdf.setDrawColor("#F3F4F6");
          pdf.setLineWidth(0.5);
          pdf.line(M, y, pageW - M, y);
        });

        const helperText = ft2 === "other"
          ? "No policyholder contribution required. The at-fault party's coverage applies."
          : isFullyCovered2
            ? "No policyholder contribution required for this repair."
            : hasDeductible2
              ? "Your policy includes a deductible, which is the portion of the repair cost paid by the policyholder before insurance coverage applies."
              : "Deductible amount will be determined during final review.";
        const helperLines = pdf.splitTextToSize(helperText, W - 24) as string[];
        const helperH = helperLines.length * 13 + 12;
        need(helperH + 4);
        pdf.setFillColor("#FAFAFB");
        pdf.rect(M, y, W, helperH, "F");
        setText(10, "#6B7280", false, true);
        helperLines.forEach((ln, idx) => pdf.text(ln, M + 12, y + 14 + idx * 13));
        y += helperH + 4;
      }

      // ===== SECTION 4 — ESTIMATE SOURCES =====
      sectionLabel("Estimate Sources");
      const srcRows: { key: SourceKey; desc: string }[] = [
        { key: "mitchell", desc: "Labor benchmarks" },
        { key: "ccc", desc: "Parts pricing" },
        { key: "oem", desc: "Procedure compliance" },
        { key: "verify", desc: "Extrapolated, verification required" },
      ];
      srcRows.forEach((r) => {
        need(22);
        const c = badgeColors[r.key];
        const w = drawBadge(SOURCE_META[r.key].short, M, y + 10, c.bg, c.fg, c.border);
        setText(13, "#374151");
        pdf.text(`— ${r.desc}`, M + w + 10, y + 14);
        y += 22;
      });
      y += 4;
      wrapped(
        "Methodology: Draft estimates combine industry labor benchmarks, current parts pricing, and OEM repair procedures. Items lacking sufficient evidence are extrapolated from comparable claims and flagged for human verification.",
        M,
        W,
        12,
        "#6B7280",
      );

      // ===== SECTION 4b — ESTIMATE ADJUSTMENTS & OVERRIDE RECORD =====
      sectionLabel("Estimate Adjustments & Override Record");
      {
        const reasonText = (i: number): string => {
          const o = overrides[i];
          if (!o || !o.reason) return "Rationale not recorded";
          switch (o.reason) {
            case "additional_damage":
              return "Additional damage visible not captured in photos";
            case "labor_rate":
              return "Local labor rate differs from regional benchmark";
            case "scope_change":
              return "Repair scope changed";
            case "parts_availability":
              return "Parts availability — alternative sourcing";
            case "other":
              return o.other.trim() || "Other (no detail provided)";
          }
        };
        const adjustedRows = claim.parts
          .map((part, i) => {
            const original = part.draftEstimate;
            const adj = reportAdjusted[i];
            if (adj === original) return null;
            const variance = adj - original;
            const variancePct = original !== 0 ? (variance / original) * 100 : 0;
            return { i, name: part.name, original, adj, variance, variancePct, reason: reasonText(i) };
          })
          .filter(Boolean) as { i: number; name: string; original: number; adj: number; variance: number; variancePct: number; reason: string }[];

        if (adjustedRows.length === 0) {
          need(32);
          pdf.setFillColor("#F9FAFB");
          pdf.rect(M, y, W, 28, "F");
          setText(12, "#6B7280", false, true);
          pdf.text("No adjustments made. Draft estimate approved as reviewed.", M + 12, y + 18);
          y += 36;
        } else {
          // Page break if table would start within 150pt of bottom
          if (y + 150 > pageH - M - 30) {
            pdf.addPage();
            y = M;
          }
          // Override table columns: Item 25%, Draft 13%, Adjusted 13%, Var 12%, Var% 10%, Rationale 27%
          const cName = M;                           // text left
          const itemMaxW = Math.round(W * 0.25) - 6;
          const cDraft = M + Math.round(W * 0.38);   // right-align
          const cAdj = M + Math.round(W * 0.51);     // right-align
          const cVar = M + Math.round(W * 0.63);     // right-align
          const cPct = M + Math.round(W * 0.73);     // right-align
          const cReason = M + Math.round(W * 0.73) + 6; // text left
          const reasonMaxW = pageW - M - cReason;
          need(24);
          setText(9, "#6B7280", true);
          pdf.text("LINE ITEM", cName, y + 10);
          pdf.text("DRAFT", cDraft, y + 10, { align: "right" });
          pdf.text("ADJUSTED", cAdj, y + 10, { align: "right" });
          pdf.text("VARIANCE", cVar, y + 10, { align: "right" });
          pdf.text("VAR %", cPct, y + 10, { align: "right" });
          pdf.text("RATIONALE", cReason, y + 10);
          y += 16;
          pdf.setDrawColor("#E5E7EB");
          pdf.setLineWidth(0.5);
          pdf.line(M, y, pageW - M, y);
          y += 4;


          let draftSum = 0;
          let adjSum = 0;
          claim.parts.forEach((p, i) => {
            draftSum += p.draftEstimate;
            adjSum += reportAdjusted[i];
          });

          adjustedRows.forEach((r) => {
            const nameLines = pdf.splitTextToSize(r.name, itemMaxW) as string[];
            const reasonLines = pdf.splitTextToSize(r.reason, reasonMaxW) as string[];
            const isSignificant = Math.abs(r.variancePct) > 20;
            const extraH = isSignificant ? 14 : 0;
            const rowH = Math.max(nameLines.length, reasonLines.length) * 14 + 10 + extraH;
            need(rowH);
            const rowY = y + 14;
            setText(12, "#111827");
            nameLines.forEach((ln, idx) => pdf.text(ln, cName, rowY + idx * 14));
            setText(12, "#374151");
            pdf.text(fmtCurrency(r.original), cDraft, rowY, { align: "right" });
            pdf.text(fmtCurrency(r.adj), cAdj, rowY, { align: "right" });
            const varColor = r.variance > 0 ? "#B45309" : "#047857";
            setText(12, varColor, true);
            const sign = r.variance > 0 ? "+" : "−";
            pdf.text(`${sign}${fmtCurrency(Math.abs(r.variance))}`, cVar, rowY, { align: "right" });
            pdf.text(`${r.variance > 0 ? "+" : "−"}${Math.abs(r.variancePct).toFixed(1)}%`, cPct, rowY, { align: "right" });
            setText(11, "#374151", false, true);
            reasonLines.forEach((ln, idx) => pdf.text(ln, cReason, rowY + idx * 14));
            if (isSignificant) {
              const flagY = rowY + Math.max(nameLines.length, reasonLines.length) * 14;
              setText(11, "#B45309", true);
              pdf.text("⚠ Significant adjustment", cName, flagY);
            }
            y += rowH;
            pdf.setDrawColor("#F3F4F6");
            pdf.line(M, y, pageW - M, y);
          });

          // Summary totals
          const netVar = adjSum - draftSum;
          const netVarPct = draftSum !== 0 ? (netVar / draftSum) * 100 : 0;
          y += 6;
          need(60);
          setText(12, "#374151");
          pdf.text("Draft Total", M, y + 12);
          pdf.text(fmtCurrency(draftSum), pageW - M, y + 12, { align: "right" });
          y += 16;
          pdf.text("Adjusted Total", M, y + 12);
          pdf.text(fmtCurrency(adjSum), pageW - M, y + 12, { align: "right" });
          y += 16;
          setText(12, "#111827", true);
          pdf.text("Net Variance", M, y + 12);
          const netSign = netVar >= 0 ? "+" : "−";
          const netColor = netVar > 0 ? "#B45309" : netVar < 0 ? "#047857" : "#111827";
          setText(12, netColor, true);
          pdf.text(
            `${netSign}${fmtCurrency(Math.abs(netVar))} (${netVar >= 0 ? "+" : "−"}${Math.abs(netVarPct).toFixed(1)}%)`,
            pageW - M,
            y + 12,
            { align: "right" },
          );
          y += 20;

          // Significant variance indicator
          if (Math.abs(netVarPct) > 20) {
            need(22);
            setText(11, "#B45309", true);
            pdf.text("⚠  Significant adjustment", M, y + 12);
            y += 18;
          }

          // Auditability callout
          y += 4;
          const calloutLines = pdf.splitTextToSize(
            "All estimate adjustments are recorded with supporting rationale to preserve review transparency and operational auditability.",
            W - 24,
          ) as string[];
          const calloutH = calloutLines.length * 14 + 16;
          need(calloutH + 4);
          pdf.setFillColor("#F8FAFC");
          pdf.rect(M, y, W, calloutH, "F");
          pdf.setFillColor("#3B82F6");
          pdf.rect(M, y, 3, calloutH, "F");
          setText(11, "#475569");
          calloutLines.forEach((ln, idx) => pdf.text(ln, M + 14, y + 14 + idx * 14));
          y += calloutH + 8;
        }
      }

      // ===== SECTION 5 — ADJUSTER NOTES =====
      sectionLabel("Adjuster Notes");
      const notesText = adjusterNotes.trim();
      setText(13, "#111827");
      const noteLines = pdf.splitTextToSize(
        notesText || "No adjuster notes entered for this claim.",
        W - 24,
      ) as string[];
      const boxH = Math.max(44, noteLines.length * 16 + 20);
      need(boxH + 4);
      pdf.setFillColor("#F9FAFB");
      pdf.rect(M, y, W, boxH, "F");
      if (notesText) {
        setText(13, "#111827");
      } else {
        setText(13, "#9CA3AF", false, true);
      }
      noteLines.forEach((ln, idx) => pdf.text(ln, M + 12, y + 20 + idx * 16));
      y += boxH + 12;

      // ===== SECTION 6 — VERIFICATION & AUTHORIZATION =====
      // Force page break if fewer than 4 rows (≈ 4 × 26pt + header ≈ 130pt) fit
      if (y + 140 > pageH - M - 30) {
        pdf.addPage();
        y = M;
      }
      sectionLabel("Verification & Authorization Record");
      let verifyText: string;
      let authText: string;
      let authBg = "#F3F4F6";
      let authFg = "#374151";
      if (workflowState === "FAST_TRACK") {
        verifyText = "N/A — automated fast-track, no manual verification required";
        authText = "Auto-authorized pending confirmation";
        authBg = "#DCFCE7";
        authFg = "#15803D";
      } else if (workflowState === "SENIOR_AUTHORIZATION") {
        verifyText = "N/A — senior authorization claims bypass standard adjuster verification";
        authText = "Held — pending senior adjuster sign-off";
        authBg = "#FEF3C7";
        authFg = "#B45309";
      } else {
        verifyText = "Reviewed by adjuster";
        authText = "Submitted for authorization";
        authBg = "#DBEAFE";
        authFg = "#1D4ED8";
      }
      const vRows: {
        label: string;
        value: string;
        badge?: { bg: string; fg: string };
      }[] = [
        { label: "Review type", value: stateLabel },
        { label: "Verification checks", value: verifyText },
        { label: "Authorization status", value: authText, badge: { bg: authBg, fg: authFg } },
        { label: "Adjusted total", value: fmtCurrency(reportTotal) },
        {
          label: "Report generated",
          value: new Date().toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }),
        },
      ];
      vRows.forEach((r) => {
        need(26);
        setText(11, "#6B7280");
        pdf.text(r.label, M, y + 14);
        if (r.badge) {
          drawBadge(r.value, M + 180, y + 12, r.badge.bg, r.badge.fg);
        } else {
          setText(13, "#111827");
          const vLines = pdf.splitTextToSize(r.value, W - 180) as string[];
          vLines.forEach((ln, idx) => pdf.text(ln, M + 180, y + 14 + idx * 14));
          if (vLines.length > 1) y += (vLines.length - 1) * 14;
        }
        y += 22;
        pdf.setDrawColor("#F3F4F6");
        pdf.setLineWidth(0.5);
        pdf.line(M, y, pageW - M, y);
      });

      // ===== AUTHORIZATION RECORD (post-approval only) =====
      if (forAuthorization && authorization) {
        if (y + 200 > pageH - M - 30) {
          pdf.addPage();
          y = M;
        }
        sectionLabel("Authorization Record");
        const authDate = new Date(authorization.authorizedAt).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
        const aRows: { label: string; value: string; badge?: { bg: string; fg: string } }[] = [
          {
            label: "Status",
            value: "Authorized",
            badge: { bg: "#DCFCE7", fg: "#15803D" },
          },
          { label: "Authorized Amount", value: fmtCurrency(authorization.amount) },
          {
            label: "Deductible",
            value: authorization.hasDeductible
              ? fmtCurrency(authorization.deductibleAmount)
              : "No deductible",
          },
          { label: "Authorization Date", value: authDate },
          { label: "Authorized By", value: adjusterName },
          { label: "Repair Status", value: "Authorized for Repair" },
          {
            label: "Next Step",
            value: "Repair facility may begin authorized repairs.",
          },
        ];
        aRows.forEach((r) => {
          need(26);
          setText(11, "#6B7280");
          pdf.text(r.label, M, y + 14);
          if (r.badge) {
            drawBadge(r.value, M + 180, y + 12, r.badge.bg, r.badge.fg);
          } else {
            setText(13, "#111827");
            const vLines = pdf.splitTextToSize(r.value, W - 180) as string[];
            vLines.forEach((ln, idx) => pdf.text(ln, M + 180, y + 14 + idx * 14));
            if (vLines.length > 1) y += (vLines.length - 1) * 14;
          }
          y += 22;
          pdf.setDrawColor("#F3F4F6");
          pdf.setLineWidth(0.5);
          pdf.line(M, y, pageW - M, y);
        });
      }


      // ===== FOOTER on every page =====
      const totalPages = pdf.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        const fy = pageH - 28;
        pdf.setDrawColor("#E5E7EB");
        pdf.setLineWidth(0.5);
        pdf.line(M, fy - 12, pageW - M, fy - 12);
        setText(11, "#9CA3AF");
        pdf.text(
          forAuthorization
            ? `Authorized repair estimate. Authorization issued for Claim #${claimRef}.`
            : "Draft assessment generated for review purposes. Not a final repair authorization.",
          M,
          fy,
        );
        pdf.text(`Claim #${claim.id} · ${dateStr}`, pageW - M, fy, { align: "right" });
      }

      pdf.save(fileName);
      toast.success("Report downloaded", { id: tid, description: fileName });
    } catch (error) {
      console.error(error);
      toast.error("Report could not be generated", {
        id: tid,
        description: "Please try again after confirming the estimate values.",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Keep parent ref updated with latest closure so post-cockpit screens can trigger PDF
  useEffect(() => {
    generateReportRef.current = generateReport;
  });



  return (
    <div className="flex flex-col min-h-full gap-4">
      {/* Estimate table */}
      <div className="shrink-0 overflow-x-auto">
        {seniorReview && (
          <div
            className="text-right text-[12px] mb-1.5"
            style={{ color: "#92400E" }}
          >
            Changes made at this review level remain pending senior authorization.
          </div>
        )}
        <table className="w-full min-w-[560px] text-sm border-collapse">
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
              const isExpanded = expanded === i;
              const isHighlighted = highlightedPart === i;
              const hasOverlay = (OVERLAYS[claim.id] ?? []).some((o) => o.partIndex === i);
              const override = overrides[i];
              const pendingRationale = isOverridePending(i);
              const confirmedOverride =
                !!override && diff !== 0 && isOverrideConfirmed(override);
              const rowBg = isHighlighted
                ? "#DBEAFE"
                : pendingRationale
                  ? "#FEF3C7"
                  : variance
                    ? COLORS.amberBg
                    : "transparent";
              return (
                <Fragment key={i}>
                <tr
                  onClick={() => hasOverlay && onHighlight(i)}
                  style={{
                    backgroundColor: rowBg,
                    borderBottom:
                      isExpanded || pendingRationale ? "none" : `1px solid ${COLORS.border}`,
                    cursor: hasOverlay ? "pointer" : "default",
                    boxShadow: isHighlighted ? "inset 3px 0 0 #2563EB" : "none",
                    transition: "background-color 150ms ease",
                  }}
                >
                  <td className="py-2.5 pr-2 align-top">
                    <button
                      type="button"
                      data-line-item-toggle
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(i);
                      }}
                      className="flex items-start gap-1.5 text-left hover:opacity-80 transition-opacity"
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? "Hide" : "Show"} cost breakdown for ${part.name}`}
                    >
                      <span
                        aria-hidden="true"
                        className="inline-block text-[10px] mt-1 transition-transform"
                        style={{
                          color: COLORS.muted,
                          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                        }}
                      >
                        ▶
                      </span>
                      <span>
                        <span className="font-medium" style={{ color: COLORS.text }}>
                          {part.name}
                          {hasOverlay && (
                            <span
                              className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full align-middle"
                              style={{ backgroundColor: "#2563EB" }}
                              aria-label="Linked to image overlay"
                            />
                          )}
                        </span>
                        {part.flagged && (
                          <div
                            className="text-[11px] italic mt-0.5 leading-snug"
                            style={{ color: "#B45309" }}
                          >
                            ⚠ Estimate extrapolated — no direct database match for this damage type on this vehicle. Verify scope before authorizing.
                          </div>
                        )}
                        <div className="text-xs mt-0.5" style={{ color: COLORS.muted }}>
                          {part.suggestedRepairScope} · {part.laborHours} hrs
                        </div>
                      </span>
                    </button>
                  </td>

                  <td
                    className="py-2.5 px-2 text-right align-top tabular-nums"
                    style={{ color: COLORS.muted }}
                  >
                    {fmtCurrency(draft)}
                  </td>
                  <td className="py-2.5 px-2 text-right align-top">
                    <div className="flex items-center justify-end gap-1.5">
                      {confirmedOverride && (
                        <span
                          className="text-[10px] font-semibold rounded px-1.5 py-0.5"
                          style={{
                            color: COLORS.amberText,
                            backgroundColor: COLORS.amberBg,
                            border: `1px solid ${COLORS.amberBorder}`,
                          }}
                          title="Adjuster override with recorded rationale"
                        >
                          Adjusted {diff > 0 ? "↑" : "↓"}
                        </span>
                      )}
                      <input
                        onClick={(e) => e.stopPropagation()}
                        type="number"
                        step="0.01"
                        value={drafts[i]}
                        readOnly={!editMode}
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
                          borderColor: editMode ? "#93C5FD" : "#D1D5DB",
                          backgroundColor: editMode ? COLORS.surface : "#F9FAFB",
                          color: editMode ? COLORS.text : COLORS.muted,
                          cursor: editMode ? "text" : "not-allowed",
                        }}
                      />
                    </div>
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
                {pendingRationale && (
                  <tr style={{ borderBottom: `1px solid ${COLORS.border}`, backgroundColor: "#FEF3C7" }}>
                    <td colSpan={4} className="px-3 pb-3 pt-1">
                      <div
                        className="rounded-md border p-3"
                        style={{
                          backgroundColor: COLORS.surface,
                          borderColor: COLORS.amberBorder,
                        }}
                      >
                        <div
                          className="text-[11px] font-semibold uppercase tracking-wider mb-2"
                          style={{ color: COLORS.amberText }}
                        >
                          Reason for adjustment (required)
                        </div>
                        <div className="space-y-1.5">
                          {([
                            ["additional_damage", "Additional damage visible not captured in photos"],
                            ["labor_rate", "Local labor rate differs from regional benchmark"],
                            ["scope_change", "Repair scope changed (repair → replace or vice versa)"],
                            ["parts_availability", "Parts availability — alternative sourcing required"],
                            ["other", "Other"],
                          ] as [RationaleCode, string][]).map(([code, label]) => {
                            const checked = override?.reason === code;
                            return (
                              <label
                                key={code}
                                className="flex items-start gap-2 text-xs cursor-pointer"
                                style={{ color: COLORS.text }}
                              >
                                <input
                                  type="radio"
                                  name={`rationale-${i}`}
                                  checked={checked}
                                  onChange={() => setOverrideReason(i, code)}
                                  className="mt-0.5 cursor-pointer"
                                  style={{ accentColor: COLORS.amberText }}
                                />
                                <span className="leading-snug">{label}</span>
                              </label>
                            );
                          })}
                          {override?.reason === "other" && (
                            <input
                              type="text"
                              autoFocus
                              maxLength={140}
                              value={override.other}
                              onChange={(e) => setOverrideOther(i, e.target.value)}
                              placeholder="Briefly describe the reason…"
                              className="mt-1 ml-6 w-full max-w-sm rounded border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                              style={{
                                borderColor: COLORS.amberBorder,
                                backgroundColor: COLORS.surface,
                                color: COLORS.text,
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {isExpanded && (
                  <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td colSpan={4} className="px-2 pb-3">
                      <CostBreakdownPanel
                        part={part}
                        onClose={() => setExpanded(null)}
                      />
                    </td>
                  </tr>
                )}


                </Fragment>
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

      {/* Payment Summary */}
      {(() => {
        const cf = claimForm;
        const cv = cf?.coverage;
        const ft = cf?.fault;
        const dedStr = cf?.deductible?.trim() ?? "";
        const dedNum = parseFloat(dedStr.replace(/[^0-9.]/g, ""));
        const hasDeductible = ft === "policyholder";
        const deductibleAmount = hasDeductible && isFinite(dedNum) && dedNum > 0 ? dedNum : 0;
        const coveragePayout = hasDeductible ? Math.max(0, adjustedTotal - deductibleAmount) : adjustedTotal;
        const isOtherPartyAtFault = ft === "other";
        const isFullyCovered = isOtherPartyAtFault || (ft === "policyholder" && (!dedStr || dedNum <= 0));
        void cv;

        return (
          <div
            className="shrink-0 rounded-md border p-3"
            style={{
              backgroundColor: isFullyCovered ? "#F0FDF4" : "#FFFBEB",
              borderColor: isFullyCovered ? "#BBF7D0" : "#FDE68A",
            }}
          >
            <div
              className="text-[11px] font-semibold uppercase tracking-wider mb-2"
              style={{ color: COLORS.muted }}
            >
              Payment Summary
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: COLORS.text }}>Repair Estimate Total</span>
                <span className="tabular-nums font-medium" style={{ color: COLORS.text }}>
                  {fmtCurrency(adjustedTotal)}
                </span>
              </div>

              {isOtherPartyAtFault ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: COLORS.text }}>Policy Deductible</span>
                    <span className="tabular-nums font-medium" style={{ color: COLORS.greenText }}>
                      N/A
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: COLORS.text }}>Coverage Status</span>
                    <span className="font-medium" style={{ color: COLORS.greenText }}>
                      Fully Covered
                    </span>
                  </div>
                </>
              ) : isFullyCovered ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: COLORS.text }}>Policy Deductible</span>
                    <span className="tabular-nums font-medium" style={{ color: COLORS.greenText }}>
                      $0
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: COLORS.text }}>Coverage Status</span>
                    <span className="font-medium" style={{ color: COLORS.greenText }}>
                      Fully Covered
                    </span>
                  </div>
                </>
              ) : hasDeductible ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: COLORS.text }}>Policy Deductible</span>
                    <span className="tabular-nums font-medium" style={{ color: COLORS.amberText }}>
                      −{fmtCurrency(deductibleAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium" style={{ color: COLORS.text }}>
                      Estimated Insurance Coverage
                    </span>
                    <span className="tabular-nums font-bold" style={{ color: COLORS.text }}>
                      {fmtCurrency(coveragePayout)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: COLORS.text }}>Policy Deductible</span>
                  <span className="tabular-nums font-medium" style={{ color: COLORS.muted }}>
                    Pending
                  </span>
                </div>
              )}
            </div>

            <p className="text-[11px] mt-2.5 leading-snug" style={{ color: COLORS.muted }}>
              {isOtherPartyAtFault
                ? "No policyholder contribution required. The at-fault party's coverage applies."
                : isFullyCovered
                  ? "No policyholder contribution required for this repair."
                  : hasDeductible
                    ? "Your policy includes a deductible, which is the portion of the repair cost paid by the policyholder before insurance coverage applies."
                    : "Deductible amount will be determined during final review."}
            </p>
          </div>
        );
      })()}

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

      {/* Documentation Status */}
      {(() => {
        const pr = claimForm?.policeReport ?? "";
        const policePending = pr !== "uploaded";
        const photosNeeded = claim.delegationState === "VERIFICATION_RECOMMENDED";
        const seniorNeeded = seniorReview;
        const items: { label: string; status: string; tone: "ok" | "amber" | "red"; note?: string }[] = [];
        items.push(
          pr === "uploaded"
            ? { label: "Police Report", status: "On file", tone: "ok" }
            : pr === "pending"
              ? { label: "Police Report", status: "Pending", tone: "amber", note: "Police report still required before final approval." }
              : pr === "not_available"
                ? { label: "Police Report", status: "Not available", tone: "amber", note: "Police report still required before final approval." }
                : { label: "Police Report", status: "Not provided", tone: "amber", note: "Police report still required before final approval." },
        );
        if (photosNeeded) {
          items.push({ label: "Photo Evidence", status: "Additional photos required", tone: "amber", note: "Additional photos are needed to verify damage scope." });
        }
        if (seniorNeeded) {
          items.push({ label: "Authorization", status: "Awaiting authorization", tone: "red", note: "Senior authorization required before approval." });
        }
        const worst = items.some((i) => i.tone === "red") ? "red" : items.some((i) => i.tone === "amber") ? "amber" : "ok";
        const palette =
          worst === "ok"
            ? { bg: "#F0FDF4", border: "#BBF7D0", fg: "#15803D", dot: "#16A34A" }
            : worst === "amber"
              ? { bg: "#FFFBEB", border: "#FCD34D", fg: "#92400E", dot: "#D97706" }
              : { bg: "#FEF2F2", border: "#FECACA", fg: "#991B1B", dot: "#DC2626" };
        return (
          <div
            className="shrink-0 rounded-md border px-3 py-2.5"
            style={{ backgroundColor: palette.bg, borderColor: palette.border }}
          >
            <Label>Documentation</Label>
            <ul className="mt-1.5 flex flex-col gap-1.5">
              {items.map((it, idx) => {
                const itDot =
                  it.tone === "ok" ? "#16A34A" : it.tone === "amber" ? "#D97706" : "#DC2626";
                const itFg =
                  it.tone === "ok" ? "#15803D" : it.tone === "amber" ? "#92400E" : "#991B1B";
                return (
                  <li key={idx}>
                    <div className="flex items-center gap-2 text-xs" style={{ color: COLORS.text }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: itDot }} />
                      <span className="font-semibold">{it.label}:</span>
                      <span style={{ color: itFg }}>{it.status}</span>
                    </div>
                    {it.note && (
                      <p className="text-[11px] mt-0.5 ml-3.5 leading-snug" style={{ color: itFg }}>
                        {it.note}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })()}

      {/* Estimate Sources */}

      <div
        className="shrink-0 rounded-md border px-3 py-2.5"
        style={{ backgroundColor: "#FAFAFA", borderColor: COLORS.border }}
      >
        <Label>Estimate Sources</Label>
        <ul className="mt-1.5 flex flex-col gap-1 text-xs" style={{ color: COLORS.text }}>
          <li>
            <span className="font-semibold">Mitchell RepairCenter</span>
            <span style={{ color: COLORS.muted }}> — labor benchmarks</span>
          </li>
          <li>
            <span className="font-semibold">CCC Intelligent Solutions</span>
            <span style={{ color: COLORS.muted }}> — parts pricing</span>
          </li>
          <li>
            <span className="font-semibold">OEM Repair Guidelines</span>
            <span style={{ color: COLORS.muted }}> — repair procedures</span>
          </li>
        </ul>
        <p className="text-[11px] mt-2 leading-snug" style={{ color: COLORS.muted }}>
          Draft estimates combine repair labor references, parts pricing, and manufacturer repair guidance with regional adjustment factors.
        </p>
      </div>

      {/* Disclaimer */}
      <p className="shrink-0 text-[11px] leading-snug" style={{ color: COLORS.muted }}>
        Draft estimates are generated using standardized repair references and require adjuster review before final authorization.
      </p>

      {/* Override Summary */}
      {(() => {
        const overriddenItems = claim.parts
          .map((part, i) => {
            const original = part.draftEstimate;
            const adjustedVal = adjusted[i];
            if (adjustedVal === original) return null;
            const override = overrides[i];
            const reasonLabel =
              override?.reason === "additional_damage"
                ? "Additional damage visible not captured in photos"
                : override?.reason === "labor_rate"
                  ? "Local labor rate differs from regional benchmark"
                  : override?.reason === "scope_change"
                    ? "Repair scope changed (repair → replace or vice versa)"
                    : override?.reason === "parts_availability"
                      ? "Parts availability — alternative sourcing required"
                      : override?.reason === "other" && override.other.trim()
                        ? override.other.trim()
                        : "Override reason not recorded";
            return { name: part.name, original, adjustedVal, reasonLabel };
          })
          .filter(Boolean) as { name: string; original: number; adjustedVal: number; reasonLabel: string }[];
        if (overriddenItems.length === 0) return null;
        return (
          <div
            className="shrink-0 rounded-md border p-3"
            style={{ backgroundColor: "#FAFAFA", borderColor: COLORS.border }}
          >
            <div
              className="text-[11px] font-semibold uppercase tracking-wider mb-2"
              style={{ color: COLORS.muted }}
            >
              Override Summary
            </div>
            <div className="flex flex-col gap-2">
              {overriddenItems.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-0.5">
                  <div className="text-xs font-medium" style={{ color: COLORS.text }}>
                    {item.name}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.muted }}>
                    Draft estimate: {fmtCurrency(item.original)} → Adjusted: {fmtCurrency(item.adjustedVal)}
                  </div>
                  <div className="text-[11px] italic" style={{ color: COLORS.amberText }}>
                    Reason: {item.reasonLabel}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] mt-2 pt-2 leading-snug" style={{ color: COLORS.muted, borderTop: `1px solid ${COLORS.border}` }}>
              {overriddenItems.length} line item{overriddenItems.length > 1 ? "s" : ""} adjusted. All estimate adjustments will appear in the generated report and be recorded in the claim history.
            </p>
          </div>
        );
      })()}

      {/* Adjuster Notes */}
      <div className="shrink-0 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label>Adjuster Notes</Label>
          <span
            className="text-[11px] transition-opacity duration-300"
            style={{
              color: COLORS.greenText,
              opacity: notesSavedVisible ? 1 : 0,
            }}
            aria-live="polite"
          >
            ✓ Notes saved
          </span>
        </div>
        <p className="text-[11px] leading-snug" style={{ color: COLORS.muted }}>
          Optional. Add observations, verification details, repair rationale, or claim-specific notes.
        </p>
        <textarea
          ref={notesRef}
          value={adjusterNotes}
          onChange={(e) => handleNotesChange(e.target.value)}
          maxLength={NOTES_LIMIT}
          rows={4}
          placeholder={`Example:\nConfirmed bumper damage visible across two angles.\nNo visible frame involvement detected.\nRepair scope aligns with submitted photos.`}
          className="w-full rounded-md border px-3 py-2 text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            borderColor: COLORS.border,
            backgroundColor: COLORS.surface,
            color: COLORS.text,
            minHeight: "5.5rem",
          }}
        />
        <div className="flex justify-end">
          <span className="text-[11px] tabular-nums" style={{ color: COLORS.muted }}>
            {adjusterNotes.length} / {NOTES_LIMIT}
          </span>
        </div>
      </div>

      {/* Workflow Action Bar */}
      {submitError && (
        <div
          className="shrink-0 rounded-md border px-3 py-2 text-xs"
          role="alert"
          style={{
            backgroundColor: COLORS.amberBg,
            borderColor: COLORS.amberBorder,
            color: COLORS.amberText,
          }}
        >
          {submitError}
        </div>
      )}
      {(() => {
        const policeMissing = (claimForm?.policeReport ?? "") !== "uploaded";
        const photosFlagged = claim.delegationState === "VERIFICATION_RECOMMENDED";
        const structuralVisibility =
          claim.delegationState === "VERIFICATION_RECOMMENDED" ||
          claim.delegationState === "SENIOR_AUTHORIZATION";
        const uncertainScope = claim.parts.some(
          (p, i) => p.sources?.includes("verify") || p.flagged,
        );
        const verifyValue = claim.parts.reduce(
          (s, p, i) => (p.sources?.includes("verify") ? s + adjusted[i] : s),
          0,
        );
        const verifyShare = adjustedTotal > 0 ? verifyValue / adjustedTotal : 0;

        // Workflow state: SENIOR_AUTHORIZATION is automatic; otherwise FAST_TRACK vs VERIFICATION_RECOMMENDED
        const seniorAuthRequired =
          seniorReview || adjustedTotal > 5000 || verifyShare > 0.4;
        type WorkflowMode = "FAST_TRACK" | "VERIFICATION_RECOMMENDED" | "SENIOR_AUTHORIZATION";
        const workflowMode: WorkflowMode = seniorAuthRequired
          ? "SENIOR_AUTHORIZATION"
          : policeMissing || photosFlagged || uncertainScope
            ? "VERIFICATION_RECOMMENDED"
            : "FAST_TRACK";

        // Build verification-recommended items list (informational only)
        const verificationItems: string[] = [];
        if (policeMissing) verificationItems.push("Police report has not been uploaded.");
        if (photosFlagged)
          verificationItems.push(
            "Additional image coverage may improve damage verification.",
          );
        if (structuralVisibility && (photosFlagged || seniorAuthRequired))
          verificationItems.push(
            "Structural visibility is partially obstructed on one or more repair areas.",
          );
        if (uncertainScope)
          verificationItems.push(
            "Some estimate ranges were generated using comparable repair scenarios.",
          );

        const showVerificationPanel =
          workflowMode !== "FAST_TRACK" && verificationItems.length > 0;

        const primaryLabel =
          workflowMode === "SENIOR_AUTHORIZATION" ? "Submit Estimate" : "Approve Estimate";

        const _cf = claimForm;
        const _cv = _cf?.coverage;
        const _ft = _cf?.fault;
        const _dedStr = _cf?.deductible?.trim() ?? "";
        const _dedNum = parseFloat(_dedStr.replace(/[^0-9.]/g, ""));
        const approvalHasDeductible = _cv === "full" && _ft === "policyholder" && isFinite(_dedNum) && _dedNum > 0;
        const approvalDeductibleAmount = approvalHasDeductible ? _dedNum : 0;
        const approvalVehicle =
          [_cf?.year, _cf?.make, _cf?.model].filter(Boolean).join(" ").trim() || "this vehicle";

        const openFinalConfirm = (mode: typeof workflowMode) => {
          if (mode === "SENIOR_AUTHORIZATION") {
            setSeniorConfirmOpen(true);
          } else {
            setApprovalConfirmOpen(true);
          }
        };

        const handlePrimary = () => {
          if (hasPendingOverrides) {
            setSubmitError(
              "Please provide a reason for all adjusted line items before submitting.",
            );
            return;
          }
          // Lightweight pre-submission validation — informational, never blocks
          if (verificationItems.length > 0) {
            setValidationItems(verificationItems);
            setPendingPrimaryMode(workflowMode);
            setValidationOpen(true);
            return;
          }
          openFinalConfirm(workflowMode);
        };

        const confirmApproval = () => {
          setApprovalConfirmOpen(false);
          onAuthorize({
            amount: adjustedTotal,
            deductibleAmount: approvalDeductibleAmount,
            hasDeductible: approvalHasDeductible,
            authorizedAt: Date.now(),
          });
          toast.success("Estimate approved and routed for repair processing.");
        };

        const handleEditToggle = () => {
          if (editMode) syncDraftValues();
          setEditMode((v) => !v);
        };

        return (
          <>
            {/* Verification Recommended Panel — informational only, never blocks */}
            {showVerificationPanel && (
              <div
                className="shrink-0 rounded-md border-l-2 border px-3 py-2.5"
                style={{
                  backgroundColor: COLORS.amberBg,
                  borderColor: COLORS.amberBorder,
                  borderLeftColor: COLORS.amber,
                }}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    size={14}
                    className="mt-0.5 shrink-0"
                    style={{ color: COLORS.amberText }}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-xs font-semibold"
                      style={{ color: COLORS.amberText }}
                    >
                      Verification Recommended
                    </div>
                    <ul className="mt-1 flex flex-col gap-1">
                      {verificationItems.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-1.5 text-[12px] leading-snug"
                          style={{ color: "#92400E" }}
                        >
                          <span
                            className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                            style={{ backgroundColor: COLORS.amber }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Persistent Action Bar — always 3 actions, never disabled by warnings */}
            <div className="shrink-0 flex items-center gap-2 pt-1">
              {/* PRIMARY */}
              {workflowMode === "SENIOR_AUTHORIZATION" && seniorSubmitted ? (
                <div
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-md py-2.5 text-xs font-medium"
                  style={{
                    color: COLORS.muted,
                    backgroundColor: "#F9FAFB",
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <Clock size={13} />
                  Pending Senior Authorization
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handlePrimary}
                  className="flex-1 rounded-md py-2.5 text-sm font-semibold transition-colors"
                  style={{
                    backgroundColor: COLORS.blue,
                    color: "white",
                    border: "none",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = COLORS.blueHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = COLORS.blue)
                  }
                >
                  {primaryLabel}
                </button>
              )}

              {/* SECONDARY: Edit / Save Edits */}
              <button
                type="button"
                onClick={handleEditToggle}
                className="rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors"
                style={{
                  borderColor: COLORS.blue,
                  color: editMode ? "white" : COLORS.blue,
                  backgroundColor: editMode ? COLORS.blue : "transparent",
                }}
              >
                {editMode ? "Save Edits" : "Edit Estimate"}
              </button>

              {/* TERTIARY: Save & Request Information */}
              <button
                type="button"
                onClick={() => setRequestInfoOpen(true)}
                className="rounded-md border px-3 py-2.5 text-sm font-medium transition-colors"
                style={{
                  borderColor: COLORS.border,
                  color: COLORS.text,
                  backgroundColor: "white",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F9FAFB")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
              >
                Save & Request Information
              </button>
            </div>

            {/* Tertiary row: Generate Report + Add Internal Note */}
            <div className="shrink-0 flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  notesRef.current?.focus();
                  notesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="text-xs font-medium underline-offset-2 hover:underline"
                style={{ color: COLORS.muted }}
              >
                + Add Internal Note
              </button>
              <button
                type="button"
                disabled={isGeneratingReport}
                onClick={() => {
                  if (hasPendingOverrides) {
                    setSubmitError(
                      "Please provide a reason for all adjusted line items before submitting.",
                    );
                    return;
                  }
                  generateReport();
                }}
                className="inline-flex items-center gap-1 text-xs font-medium underline-offset-2 hover:underline"
                style={{ color: COLORS.blue }}
              >
                <FileText size={12} />
                {isGeneratingReport ? "Generating…" : "Generate Report"}
                <ChevronRight size={12} />
              </button>
            </div>

            {/* Approval Confirmation Modal */}
            <Dialog open={approvalConfirmOpen} onOpenChange={setApprovalConfirmOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Estimate Approval</DialogTitle>
                  <DialogDescription>
                    You are approving a repair estimate of{" "}
                    <span className="font-semibold" style={{ color: COLORS.text }}>
                      {fmtCurrency(adjustedTotal)}
                    </span>{" "}
                    for{" "}
                    <span className="font-semibold" style={{ color: COLORS.text }}>
                      {approvalVehicle}
                    </span>
                    . This will authorize repair processing for the claim.
                  </DialogDescription>
                </DialogHeader>
                {approvalHasDeductible && (
                  <div
                    className="rounded-md border px-3 py-2 text-sm"
                    style={{
                      backgroundColor: "#F9FAFB",
                      borderColor: COLORS.border,
                      color: COLORS.text,
                    }}
                  >
                    Policy deductible:{" "}
                    <span className="font-semibold tabular-nums">
                      {fmtCurrency(approvalDeductibleAmount)}
                    </span>
                  </div>
                )}
                <DialogFooter>
                  <button
                    type="button"
                    onClick={() => setApprovalConfirmOpen(false)}
                    className="rounded-md border px-4 py-2 text-sm font-medium"
                    style={{
                      borderColor: COLORS.border,
                      color: COLORS.text,
                      backgroundColor: "white",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmApproval}
                    className="rounded-md px-4 py-2 text-sm font-semibold text-white"
                    style={{ backgroundColor: COLORS.blue }}
                  >
                    Confirm & Authorize
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Senior Authorization Confirmation Modal */}
            <Dialog open={seniorConfirmOpen} onOpenChange={setSeniorConfirmOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Estimate for Senior Authorization</DialogTitle>
                  <DialogDescription>
                    You are submitting a draft estimate of{" "}
                    <span
                      className="font-semibold"
                      style={{ color: COLORS.text }}
                    >
                      {fmtCurrency(adjustedTotal)}
                    </span>{" "}
                    for{" "}
                    <span className="font-semibold" style={{ color: COLORS.text }}>
                      {[claimForm?.year, claimForm?.make, claimForm?.model]
                        .filter(Boolean)
                        .join(" ") || "this vehicle"}
                    </span>{" "}
                    for senior adjuster authorization.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <button
                    type="button"
                    onClick={() => setSeniorConfirmOpen(false)}
                    className="rounded-md border px-4 py-2 text-sm font-medium"
                    style={{
                      borderColor: COLORS.border,
                      color: COLORS.text,
                      backgroundColor: "white",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSeniorConfirmOpen(false);
                      onSeniorSubmit();
                      toast.success("Estimate submitted for senior adjuster authorization.");
                    }}
                    className="rounded-md px-4 py-2 text-sm font-semibold text-white"
                    style={{ backgroundColor: COLORS.blue }}
                  >
                    Confirm Submission
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Request Information Modal */}
            <Dialog
              open={requestInfoOpen}
              onOpenChange={(open) => {
                setRequestInfoOpen(open);
                if (!open) resetRequestInfo();
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Information</DialogTitle>
                  <DialogDescription>
                    Select what to request from the policyholder
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2.5 py-2">
                  {([
                    ["police_report", "Police report"],
                    ["additional_photos", "Additional damage photos"],
                    ["supporting_docs", "Supporting documentation"],
                    ["customer_clarification", "Customer clarification"],
                  ] as [keyof typeof requestItems, string][]).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2.5 text-sm cursor-pointer rounded-md px-2 py-1.5 hover:bg-slate-50"
                      style={{ color: COLORS.text }}
                    >
                      <input
                        type="checkbox"
                        checked={requestItems[key]}
                        onChange={(e) =>
                          setRequestItems((prev) => ({ ...prev, [key]: e.target.checked }))
                        }
                        className="w-4 h-4 rounded border-slate-300"
                      />
                      {label}
                    </label>
                  ))}
                  <div className="flex flex-col gap-1 mt-2">
                    <label
                      className="text-xs font-medium"
                      style={{ color: COLORS.muted }}
                    >
                      Message to policyholder (optional)
                    </label>
                    <textarea
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value.slice(0, 500))}
                      rows={3}
                      placeholder="Example: Please upload a copy of the police report related to this incident."
                      className="w-full rounded-md border px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        borderColor: COLORS.border,
                        backgroundColor: COLORS.surface,
                        color: COLORS.text,
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <button
                    type="button"
                    onClick={() => {
                      setRequestInfoOpen(false);
                      resetRequestInfo();
                    }}
                    className="rounded-md border px-4 py-2 text-sm font-medium"
                    style={{
                      borderColor: COLORS.border,
                      color: COLORS.text,
                      backgroundColor: "white",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!anyRequestItemSelected}
                    onClick={() => {
                      setRequestInfoOpen(false);
                      resetRequestInfo();
                      toast.success("Information request sent. Claim saved pending response.");
                    }}
                    className="rounded-md px-4 py-2 text-sm font-semibold text-white"
                    style={{
                      backgroundColor: COLORS.blue,
                      opacity: anyRequestItemSelected ? 1 : 0.55,
                      cursor: anyRequestItemSelected ? "pointer" : "not-allowed",
                    }}
                  >
                    Send Request
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Unresolved Review Items — informational validation */}
            <Dialog open={validationOpen} onOpenChange={setValidationOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Unresolved Review Items</DialogTitle>
                  <DialogDescription>
                    This estimate can still be submitted. The following items remain unresolved.
                  </DialogDescription>
                </DialogHeader>
                <div
                  className="rounded-md border-l-2 border px-3 py-3"
                  style={{
                    backgroundColor: COLORS.amberBg,
                    borderColor: COLORS.amberBorder,
                    borderLeftColor: COLORS.amber,
                  }}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      size={14}
                      className="mt-0.5 shrink-0"
                      style={{ color: COLORS.amberText }}
                    />
                    <ul className="flex flex-col gap-1.5">
                      {validationItems.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-1.5 text-[12px] leading-snug"
                          style={{ color: "#92400E" }}
                        >
                          <span
                            className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                            style={{ backgroundColor: COLORS.amber }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <DialogFooter className="sm:justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setValidationOpen(false);
                      setRequestInfoOpen(true);
                    }}
                    className="text-sm font-medium underline-offset-2 hover:underline"
                    style={{ color: COLORS.blue }}
                  >
                    Request Additional Information
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setValidationOpen(false)}
                      className="rounded-md border px-4 py-2 text-sm font-medium"
                      style={{
                        borderColor: COLORS.border,
                        color: COLORS.text,
                        backgroundColor: "white",
                      }}
                    >
                      Return to Review
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setValidationOpen(false);
                        if (pendingPrimaryMode) openFinalConfirm(pendingPrimaryMode);
                      }}
                      className="rounded-md px-4 py-2 text-sm font-semibold text-white"
                      style={{ backgroundColor: COLORS.blue }}
                    >
                      Proceed with Submission
                    </button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        );
      })()}

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
