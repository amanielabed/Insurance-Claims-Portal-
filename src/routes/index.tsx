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
  flagged: boolean;
  sources: SourceKey[];
}

interface Claim {
  id: string;
  type: string;
  delegationState: "FAST_TRACK" | "MANUAL_REVIEW" | "SENIOR_REVIEW";
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
  state: "FAST_TRACK" | "MANUAL_REVIEW" | "SENIOR_REVIEW";
}

const SCENARIOS: ScenarioMeta[] = [
  {
    id: "2026-001",
    label: "Simple Claim (Demo)",
    description: "Minor cosmetic damage with low review complexity",
    state: "FAST_TRACK",
  },
  {
    id: "2026-002",
    label: "Ambiguous Claim (Demo)",
    description: "Moderate uncertainty requiring manual verification",
    state: "MANUAL_REVIEW",
  },
  {
    id: "2026-003",
    label: "Complex Claim (Demo)",
    description: "High-value structural review requiring senior authorization",
    state: "SENIOR_REVIEW",
  },
];

const STATE_DOT: Record<ScenarioMeta["state"], string> = {
  FAST_TRACK: "#22C55E",
  MANUAL_REVIEW: "#F59E0B",
  SENIOR_REVIEW: "#DC2626",
};

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
    imageUrl: claimSimpleImage,
    parts: [
      {
        name: "Rear bumper cover repair",
        suggestedRepairScope: "Repair",
        draftEstimate: 187.5,
        laborHours: 1.5,
        flagged: false,
        sources: ["mitchell", "ccc", "oem"],
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
    estimatedCostLabel: "$1,240–$2,100",
    confidenceLabel:
      "Low resolution on rear quarter panel. Possible hidden structural damage behind deformation.",
    actionMessage:
      "Manual review required. Payment should remain paused until verification is complete.",
    imagePlaceholder: "Rear collision damage",
    imageUrl: claimComplexImage,
    parts: [
      {
        name: "Rear quarter panel skin",
        suggestedRepairScope: "Repair",
        draftEstimate: 380,
        laborHours: 3.5,
        flagged: false,
        sources: ["mitchell", "ccc"],
      },
      {
        name: "Frame rail inspection",
        suggestedRepairScope: "Inspect",
        draftEstimate: 860,
        laborHours: 3.0,
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
    delegationState: "SENIOR_REVIEW",
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
        flagged: false,
        sources: ["mitchell", "oem"],
      },
      {
        name: "Driver-side fender",
        suggestedRepairScope: "Replace",
        draftEstimate: 1280,
        laborHours: 5.5,
        flagged: false,
        sources: ["mitchell", "ccc"],
      },
      {
        name: "Hood panel",
        suggestedRepairScope: "Replace",
        draftEstimate: 1620,
        laborHours: 3.5,
        flagged: false,
        sources: ["mitchell", "oem"],
      },
      {
        name: "Front frame rail repair",
        suggestedRepairScope: "Inspect & Repair",
        draftEstimate: 2800,
        laborHours: 8.0,
        flagged: true,
        sources: ["oem", "verify"],
      },
      {
        name: "Radiator support",
        suggestedRepairScope: "Replace",
        draftEstimate: 1250,
        laborHours: 4.5,
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
  "Initiate Claim",
  "Upload Photos",
  "Draft Assessment",
  "Review Estimate",
] as const;

function Index() {
  const [step, setStep] = useState(1);
  const [claimForm, setClaimForm] = useState<ClaimForm | null>(null);

  const reset = () => {
    setClaimForm(null);
    setStep(1);
  };

  return (
    <div
      className="flex flex-col h-screen"
      style={{ backgroundColor: COLORS.bg, color: COLORS.text }}
    >
      <StepIndicator current={step} />
      <div key={step} className="flex-1 min-h-0 flex flex-col animate-fade-in">
        {step === 1 && (
          <InitiateClaimStep
            initial={claimForm}
            onContinue={(data) => {
              setClaimForm(data);
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <UploadPhotosStep
            onContinue={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && <DraftAssessmentStep onComplete={() => setStep(4)} />}
        {step === 4 && <ReviewEstimateStep claimForm={claimForm} onReset={reset} />}
      </div>
    </div>
  );
}


function StepIndicator({ current }: { current: number }) {
  return (
    <div
      className="shrink-0 border-b px-6 py-3"
      style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
    >
      <ol className="flex items-center gap-2 max-w-5xl mx-auto">
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
                  {done ? "✓" : n}
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
                  style={{ backgroundColor: done ? COLORS.green : "#E5E7EB" }}
                />
              )}
            </li>
          );
        })}
      </ol>
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
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [extraPhotos, setExtraPhotos] = useState<{ id: string; url: string }[]>([]);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const extraInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (slotId: string, file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotos((prev) => ({ ...prev, [slotId]: url }));
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
            onClick={onContinue}
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

const PROCESSING_STEPS: { label: string; duration: number }[] = [
  { label: "Photo quality validation complete — all required views meet minimum clarity standards", duration: 600 },
  { label: "Vehicle identified: 2022 Toyota Camry SE", duration: 600 },
  { label: "Analyzing visible damage regions and identifying affected parts…", duration: 1100 },
  { label: "Cross-checking repair scope against repair-cost references…", duration: 1000 },
  { label: "Claim complexity evaluated — routing to appropriate review workflow", duration: 600 },
];

function DraftAssessmentStep({ onComplete }: { onComplete: () => void }) {
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

type PolicyLookup = { year: string; make: string; model: string };

function lookupPolicy(policyNumber: string): PolicyLookup | null {
  const p = policyNumber.trim().toUpperCase();
  if (p.startsWith("POL-2026")) return { year: "2023", make: "Toyota", model: "Camry XSE" };
  if (p.startsWith("POL-2025")) return { year: "2021", make: "Honda", model: "CR-V EX" };
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
    fullName: "Jordan M. Whitaker",
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
    coverage: "full",
    fault: "other",
    deductible: "",
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
  const [deductible, setDeductible] = useState("");
  const [validated, setValidated] = useState<ValidatedPolicy | null>(null);
  const [eligibilityPassed, setEligibilityPassed] = useState(false);

  const eligibility = (() => {
    if (!validated || !fault) return null;
    const coverage = validated.coverage;
    if (coverage === "third_party" && fault === "single_vehicle") {
      return { tone: "red" as const, title: "Coverage not available for this incident type.", body: "Single-vehicle incidents are not covered under a third-party only policy.", action: "Exit Claim", canContinue: false };
    }
    if (coverage === "third_party" && fault === "policyholder") {
      return { tone: "amber" as const, title: "Limited coverage detected.", body: "This policy may not cover repairs to the policyholder's vehicle under the current fault assessment.", action: "Continue Documentation", note: "Damage details may still be collected for claim records.", canContinue: true };
    }
    if (coverage === "third_party" && fault === "other") {
      return { tone: "blue" as const, title: "External insurer workflow likely required.", body: "Damage documentation may be used to support coordination with the other party's insurer.", action: "Continue Documentation", canContinue: true };
    }
    if (coverage === "third_party" && fault === "unclear") {
      return { tone: "amber" as const, title: "Limited coverage — pending fault outcome.", body: "Documentation may proceed; final eligibility depends on the fault investigation.", action: "Continue Documentation", canContinue: true };
    }
    if (coverage === "full" && fault === "policyholder") {
      return { tone: "green" as const, title: "Coverage confirmed.", body: "This policy includes coverage for the reported vehicle damage. Deductible may apply.", action: "Continue Claim Review", showDeductible: true, canContinue: true };
    }
    if (coverage === "full" && fault === "other") {
      return { tone: "green" as const, title: "Coverage confirmed.", body: "Vehicle damage is eligible for claim processing under this policy.", action: "Continue Claim Review", canContinue: true };
    }
    if (coverage === "full" && fault === "unclear") {
      return { tone: "amber" as const, title: "Claim eligible for review.", body: "Final authorization may depend on the outcome of the fault investigation. Additional verification may be required.", action: "Continue Claim Review", canContinue: true };
    }
    if (coverage === "full" && fault === "single_vehicle") {
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
            fault={fault}
            setFault={(v) => { setFault(v); }}
            deductible={deductible}
            setDeductible={setDeductible}
            validated={validated}
            setValidated={setValidated}
            eligibility={eligibility}
            onContinue={() => {
              if (validated) {
                setForm((prev) => ({
                  ...prev,
                  policyNumber: validated.policyNumber,
                  fullName: prev.fullName || validated.holderName,
                  year: validated.year,
                  make: validated.make,
                  model: validated.model,
                  vehicleAutoFilled: true,
                  coverage: validated.coverage,
                  fault: fault || "",
                  deductible: deductible,
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
              This form is for own-vehicle damage claims only. For third-party or liability claims,
              contact your claims supervisor.
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
                Manual review required before authorization.
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
type ValidatedPolicy = { policyNumber: string; year: string; make: string; model: string; holderName: string; coverage: "full" | "third_party" };
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
  policyNumber, setPolicyNumber, fault, setFault, deductible, setDeductible, validated, setValidated, eligibility, onContinue,
}: {
  policyNumber: string;
  setPolicyNumber: (v: string) => void;
  fault: FaultVal;
  setFault: (v: FaultVal) => void;
  deductible: string;
  setDeductible: (v: string) => void;
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

  const handleValidate = () => {
    const v = policyNumber.trim();
    if (!v) { setLookupError("Policy number is required."); return; }
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
      const upper = v.toUpperCase();
      const coverage: "full" | "third_party" = upper.startsWith("POL-2025") ? "third_party" : "full";
      const holderName = upper.startsWith("POL-2025") ? "Alex R. Morgan" : "Jordan M. Whitaker";
      setValidated({ policyNumber: v, ...result, holderName, coverage });
      setValidating(false);
    }, 700);
  };

  const handlePolicyChange = (v: string) => {
    setPolicyNumber(v);
    if (validated) setValidated(null);
    if (lookupError) setLookupError(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight">Coverage Eligibility Check</h2>
        <p className="text-sm mt-1" style={{ color: COLORS.muted }}>
          We need a few details before beginning the claim review.
        </p>
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
          <p className="text-[11px] mt-2" style={{ color: COLORS.muted }}>
            Try POL-2026-48201 (Full Coverage) or POL-2025-77310 (Third-Party).
          </p>
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
                {validated.coverage === "full" ? "Full Coverage (Comprehensive)" : "Third-Party Coverage"}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase mb-1" style={{ color: COLORS.muted, letterSpacing: "0.08em" }}>Policyholder</div>
              <div className="text-sm font-medium" style={{ color: COLORS.text }}>{validated.holderName}</div>
            </div>
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
          {eligibility.showDeductible && (
            <div className="mt-4 max-w-xs">
              <label className="text-xs font-medium block mb-1.5" style={{ color: COLORS.text }}>
                Deductible amount (optional)
              </label>
              <TextInput
                type="number"
                value={deductible}
                onChange={setDeductible}
                placeholder="$0"
              />
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

function ReviewEstimateStep({
  claimForm,
  onReset,
}: {
  claimForm: ClaimForm | null;
  onReset: () => void;
}) {
  const [selectedId, setSelectedId] = useState(claimData[0].id);
  const claim = useMemo(
    () => claimData.find((c) => c.id === selectedId) ?? claimData[0],
    [selectedId],
  );

  const [seniorReview, setSeniorReview] = useState(claim.delegationState === "SENIOR_REVIEW");
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [highlightedPart, setHighlightedPart] = useState<number | null>(null);

  // Sync escalation when switching claims — auto-load senior review for SENIOR_REVIEW scenarios
  useEffect(() => {
    setSeniorReview(claim.delegationState === "SENIOR_REVIEW");
    setHighlightedPart(null);
  }, [selectedId, claim.delegationState]);

  const isFastTrack = claim.delegationState === "FAST_TRACK";

  const workflowState: "FAST_TRACK" | "MANUAL_REVIEW" | "SENIOR_REVIEW" =
    seniorReview || claim.delegationState === "SENIOR_REVIEW"
      ? "SENIOR_REVIEW"
      : claim.delegationState;

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

  const currentScenario = SCENARIOS.find((s) => s.id === selectedId) ?? SCENARIOS[0];

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
      {claimForm && (claimForm.coverage || claimForm.fault) && (() => {
        const coverageLabel =
          claimForm.coverage === "full" ? "Full" :
          claimForm.coverage === "third_party" ? "Third-party" : "—";
        const faultLabel =
          claimForm.fault === "policyholder" ? "At fault" :
          claimForm.fault === "other" ? "Not at fault" :
          claimForm.fault === "unclear" ? "Disputed" :
          claimForm.fault === "single_vehicle" ? "Single-vehicle" : "—";
        const ded = claimForm.deductible?.trim();
        const deductibleLabel =
          claimForm.coverage === "full" && claimForm.fault === "policyholder" && ded
            ? `$${ded}`
            : "N/A";
        return (
          <div
            className="flex items-center gap-6 px-6 h-8 border-b shrink-0"
            style={{ backgroundColor: "#F9FAFB", borderColor: COLORS.border }}
          >
            <div className="flex items-center gap-2 text-[11px]">
              <span className="uppercase tracking-wider font-semibold" style={{ color: COLORS.muted, letterSpacing: "0.08em" }}>
                Coverage type:
              </span>
              <span className="font-medium" style={{ color: COLORS.text }}>{coverageLabel}</span>
            </div>
            <div className="h-3 w-px" style={{ backgroundColor: COLORS.border }} />
            <div className="flex items-center gap-2 text-[11px]">
              <span className="uppercase tracking-wider font-semibold" style={{ color: COLORS.muted, letterSpacing: "0.08em" }}>
                Fault:
              </span>
              <span className="font-medium" style={{ color: COLORS.text }}>{faultLabel}</span>
            </div>
            <div className="h-3 w-px" style={{ backgroundColor: COLORS.border }} />
            <div className="flex items-center gap-2 text-[11px]">
              <span className="uppercase tracking-wider font-semibold" style={{ color: COLORS.muted, letterSpacing: "0.08em" }}>
                Deductible:
              </span>
              <span className="font-medium tabular-nums" style={{ color: COLORS.text }}>{deductibleLabel}</span>
            </div>
          </div>
        );
      })()}

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
              {claimForm ? (
                <>
                  <div className="text-sm font-semibold tracking-tight truncate">
                    Reviewing Claim for: {claimForm.fullName}
                  </div>
                  <div className="text-[11px] truncate" style={{ color: COLORS.muted }}>
                    Policy: {claimForm.policyNumber}
                  </div>
                </>
              ) : (
                <h1 className="text-sm font-semibold tracking-tight">
                  Claims Review Cockpit
                </h1>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs font-medium" style={{ color: COLORS.muted }}>
            Scenario
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
        {workflowState === "SENIOR_REVIEW" ? (
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
        key={claim.id}
        className="flex-1 min-h-0 grid grid-cols-[minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(420px,1.35fr)] gap-4 p-4 animate-fade-in"
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
          <AssessmentReviewPanel claim={claim} />
        </Panel>

        {/* Right: Estimate Review */}
        <Panel title="Estimate Review">
          <EstimateReviewPanel
            key={claim.id}
            claim={claim}
            claimForm={claimForm}
            isFastTrack={isFastTrack}
            seniorReview={seniorReview}
            onTriggerSeniorReview={() => setSeniorReview(true)}
            highlightedPart={highlightedPart}
            onHighlight={(idx) =>
              setHighlightedPart((cur) => (cur === idx ? null : idx))
            }
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
  source,
  onClose,
}: {
  part: Claim["parts"][number];
  source: SourceKey;
  onClose: () => void;
}) {
  const meta = SOURCE_META[source];
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (panelRef.current?.contains(target)) return;
      if (target.closest("[data-source-badge]")) return;
      onClose();
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [onClose]);

  type Row = { label: string; value: string; emphasis?: boolean };
  const rows: Row[] =
    source === "mitchell"
      ? [
          { label: "Base labor hours", value: `${part.laborHours} hrs` },
          { label: "Regional rate", value: "$95/hr" },
          { label: "Complexity factor", value: "×1.0 (standard)" },
          { label: "Subtotal", value: fmtCurrency(part.laborHours * 95), emphasis: true },
        ]
      : source === "ccc"
        ? [
            { label: "OEM part price", value: "$340.00" },
            { label: "Aftermarket option", value: "$187.00" },
            { label: "Selected basis", value: "Aftermarket" },
            { label: "Rationale", value: "Cosmetic damage — aftermarket meets standard" },
            { label: "Subtotal", value: "$187.00", emphasis: true },
          ]
        : source === "oem"
          ? [
              { label: "OEM part reference", value: `${part.name} (OEM)` },
              { label: "Manufacturer guideline", value: "Structural Repair Manual (2024 rev.)" },
              { label: "Applied procedure", value: "OEM-specified repair & paint calibration" },
              { label: "Subtotal", value: fmtCurrency(part.draftEstimate), emphasis: true },
            ]
          : [
              { label: "Comparable vehicle", value: "2022 Camry LE" },
              { label: "Similar damage ref", value: "$820–$1,240" },
              { label: "Applied estimate", value: "$890 (midpoint)" },
              { label: "Confidence", value: "Low — verify", emphasis: true },
            ];

  const sourceReference: Record<SourceKey, string> = {
    mitchell: "Mitchell RepairCenter | Regional Dataset v2026.1 | Updated March 2026",
    ccc: "CCC Intelligent Solutions | Parts Pricing v2026.1 | Updated March 2026",
    oem: "OEM Repair Guidelines | Toyota Structural Manual 2024 | Updated Jan 2026",
    verify: "Internal Comparables Database | v2026.1 | Updated March 2026",
  };

  return (
    <div
      ref={panelRef}
      className="relative rounded-md border p-3 animate-fade-in"
      style={{ backgroundColor: meta.bg, borderColor: meta.border }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close breakdown"
        className="absolute top-2 right-2 text-xs font-medium px-1.5 py-0.5 rounded hover:bg-black/5"
        style={{ color: meta.fg }}
      >
        Close ×
      </button>

      <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: meta.fg }}>
        How This Estimate Was Calculated
      </div>
      <div className="rounded border overflow-hidden mb-3" style={{ borderColor: meta.border, backgroundColor: COLORS.surface }}>
        <table className="w-full text-xs">
          <tbody>
            {rows.map((r, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom:
                    idx === rows.length - 1 ? "none" : `1px solid ${meta.border}`,
                  backgroundColor: r.emphasis ? meta.bg : "transparent",
                }}
              >
                <td className="py-1.5 px-2.5 align-top" style={{ color: COLORS.muted, width: "45%" }}>
                  {r.label}
                </td>
                <td
                  className="py-1.5 px-2.5 align-top tabular-nums"
                  style={{ color: COLORS.text, fontWeight: r.emphasis ? 600 : 400 }}
                >
                  {r.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: meta.fg }}>
        Source Reference
      </div>
      <div className="text-xs" style={{ color: COLORS.text }}>
        {sourceReference[source]}
      </div>
    </div>
  );
}




function EstimateReviewPanel({
  claim,
  claimForm,
  isFastTrack,
  seniorReview,
  onTriggerSeniorReview,
  highlightedPart,
  onHighlight,
}: {
  claim: Claim;
  claimForm: ClaimForm | null;
  isFastTrack: boolean;
  seniorReview: boolean;
  onTriggerSeniorReview: () => void;
  highlightedPart: number | null;
  onHighlight: (partIndex: number) => void;
}) {
  const [adjusted, setAdjusted] = useState<number[]>(() =>
    claim.parts.map((p) => p.draftEstimate),
  );
  const [drafts, setDrafts] = useState<string[]>(() =>
    claim.parts.map((p) => p.draftEstimate.toFixed(2)),
  );
  const [log, setLog] = useState<LogEntry[]>([]);
  const [expanded, setExpanded] = useState<{ row: number; source: SourceKey } | null>(null);
  const toggleSource = (row: number, source: SourceKey) =>
    setExpanded((prev) =>
      prev && prev.row === row && prev.source === source ? null : { row, source },
    );
  const [checks, setChecks] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const allChecked = checks.every(Boolean);
  const toggle = (i: number) =>
    setChecks((prev) => {
      const next = [...prev] as [boolean, boolean, boolean];
      next[i] = !next[i];
      return next;
    });

  const NOTES_LIMIT = 500;
  const [adjusterNotes, setAdjusterNotes] = useState("");
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

  const [editMode, setEditMode] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);



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
  };

  const generateReport = async () => {
    const reportAdjusted = syncDraftValues();
    const reportTotal = reportAdjusted.reduce((s, n) => s + (isFinite(n) ? n : 0), 0);
    const fileName = `Claim_${claim.id}_Assessment.pdf`;

    const workflowState: "FAST_TRACK" | "MANUAL_REVIEW" | "SENIOR_REVIEW" =
      seniorReview || claim.delegationState === "SENIOR_REVIEW"
        ? "SENIOR_REVIEW"
        : claim.delegationState;
    const stateLabel = {
      FAST_TRACK: "Fast-Track",
      MANUAL_REVIEW: "Manual Review",
      SENIOR_REVIEW: "Senior Review",
    }[workflowState];
    const stateBadge = {
      FAST_TRACK: { bg: "#DCFCE7", fg: "#15803D" },
      MANUAL_REVIEW: { bg: "#FEF3C7", fg: "#B45309" },
      SENIOR_REVIEW: { bg: "#FEE2E2", fg: "#B91C1C" },
    }[workflowState];

    setIsGeneratingReport(true);
    const tid = toast.loading("Generating claim summary report…");

    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const M = 48;
      const W = pageW - M * 2;
      let y = M;

      const need = (h: number) => {
        if (y + h > pageH - M - 30) {
          pdf.addPage();
          y = M;
        }
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
        need(30);
        y += 8;
        setText(11, "#6B7280", true);
        // letter-spacing emulated by adding spaces between chars is ugly; rely on uppercase
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
        cf2?.coverage === "full" && cf2?.fault === "policyholder"
          ? (dedEntered ? `$${dedEntered}` : "$0")
          : cf2?.coverage === "full"
            ? "None"
            : cf2?.coverage === "third_party"
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


      if (workflowState === "SENIOR_REVIEW") {
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
        ["Date of loss", cf?.dateOfLoss || "—"],
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
      // photos row
      need(64);
      setText(11, "#6B7280");
      pdf.text("Photos submitted", labelX, y + 14);
      const thumbW = 60;
      const thumbH = 48;
      for (let i = 0; i < 3; i++) {
        const tx = valX + i * (thumbW + 10);
        const ty = y + 4;
        pdf.setFillColor("#F9FAFB");
        pdf.setDrawColor("#E5E7EB");
        pdf.setLineWidth(0.5);
        pdf.roundedRect(tx, ty, thumbW, thumbH, 3, 3, "FD");
        // simple camera icon
        pdf.setFillColor("#D1D5DB");
        pdf.rect(tx + 18, ty + 14, 24, 16, "F");
        pdf.setFillColor("#9CA3AF");
        pdf.circle(tx + 30, ty + 22, 4, "F");
        setText(8, "#6B7280");
        pdf.text(`Photo ${i + 1}`, tx + thumbW / 2, ty + thumbH - 4, { align: "center" });
      }
      y += thumbH + 16;
      pdf.setDrawColor("#F3F4F6");
      pdf.setLineWidth(0.5);
      pdf.line(M, y, pageW - M, y);

      // ===== SECTION 2b — COVERAGE SUMMARY =====
      sectionLabel("Coverage Summary");
      const cv = cf?.coverage;
      const ft = cf?.fault;
      const coverageTypeText =
        cv === "full" ? "Full Coverage (Comprehensive)" :
        cv === "third_party" ? "Third-Party Coverage" : "—";
      const faultText =
        ft === "policyholder" ? "Policyholder at fault" :
        ft === "other" ? "Other party at fault" :
        ft === "unclear" ? "Fault disputed / unclear" :
        ft === "single_vehicle" ? "Single-vehicle incident" : "—";
      const dedVal = cf?.deductible?.trim();
      const deductibleApplicable =
        cv === "full" && ft === "policyholder"
          ? (dedVal ? `Yes — $${dedVal}` : "Yes — amount pending")
          : cv === "full"
            ? "No"
            : cv === "third_party"
              ? "No — third-party policy"
              : "Pending";
      const claimBasis =
        cv === "full"
          ? "Own damage — full coverage"
          : cv === "third_party"
            ? "Third-party documentation — liability claim"
            : "—";
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
      y += 4;



      // ===== SECTION 3 — ESTIMATE BREAKDOWN =====
      sectionLabel("Estimate Breakdown");
      const colItem = M;
      const colScope = M + 190;
      const colLabor = M + 260;
      const colBasis = M + 310;
      const colEst = pageW - M;
      need(24);
      setText(11, "#6B7280", true);
      pdf.text("LINE ITEM", colItem, y + 10);
      pdf.text("SCOPE", colScope, y + 10);
      pdf.text("LABOR", colLabor, y + 10);
      pdf.text("COST BASIS", colBasis, y + 10);
      pdf.text("DRAFT ESTIMATE", colEst, y + 10, { align: "right" });
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
        const adjVal = reportAdjusted[i];
        const hasVerify = part.sources.includes("verify");
        need(28);
        const rowY = y + 14;
        setText(13, "#111827");
        const nameLines = pdf.splitTextToSize(part.name, 180) as string[];
        pdf.text(nameLines[0], colItem, rowY);
        setText(13, "#374151");
        pdf.text(part.suggestedRepairScope, colScope, rowY);
        pdf.text(`${part.laborHours}h`, colLabor, rowY);
        let bx = colBasis;
        part.sources.forEach((src) => {
          const c = badgeColors[src];
          const w = drawBadge(SOURCE_META[src].short, bx, rowY - 4, c.bg, c.fg, c.border);
          bx += w + 4;
        });
        // amount (right-aligned)
        if (hasVerify) {
          // warning triangle
          const tri = colEst - pdf.getTextWidth(fmtCurrency(adjVal)) - 14;
          pdf.setFillColor("#F59E0B");
          pdf.triangle(tri, rowY - 1, tri + 9, rowY - 1, tri + 4.5, rowY - 9, "F");
          setText(13, "#B45309", true);
        } else {
          setText(13, "#111827");
        }
        pdf.text(fmtCurrency(adjVal), colEst, rowY, { align: "right" });
        y += 24;
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
        "Methodology: Draft estimates combine third-party labor benchmarks, current parts pricing, and OEM repair procedures. Items lacking sufficient evidence are extrapolated from comparable claims and flagged for human verification.",
        M,
        W,
        12,
        "#6B7280",
      );

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
      } else if (workflowState === "SENIOR_REVIEW") {
        verifyText = "N/A — senior review claims bypass standard adjuster verification";
        authText = "Held — pending senior adjuster sign-off";
        authBg = "#FEF3C7";
        authFg = "#B45309";
      } else {
        const completed = checks.filter(Boolean).length;
        verifyText = `${completed} of 3 completed`;
        if (completed === 3) {
          authText = "Submitted for authorization";
          authBg = "#DBEAFE";
          authFg = "#1D4ED8";
        } else {
          authText = "Pending adjuster approval";
          authBg = "#FEF3C7";
          authFg = "#B45309";
        }
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
          "Draft assessment generated for review purposes. Not a final repair authorization.",
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

  return (
    <div className="flex flex-col min-h-full gap-4">
      {/* Estimate table */}
      <div className="shrink-0 overflow-x-auto">
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
                className="text-left font-semibold uppercase tracking-wider text-[10px] pb-2 px-2"
                style={{ color: COLORS.muted }}
                title="Click any source badge to see the full calculation breakdown for that line item."
              >
                Cost Basis <span aria-hidden="true">ⓘ</span>
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
              const isExpanded = expanded?.row === i;
              const isHighlighted = highlightedPart === i;
              const hasOverlay = (OVERLAYS[claim.id] ?? []).some((o) => o.partIndex === i);
              return (
                <Fragment key={i}>
                <tr
                  onClick={() => hasOverlay && onHighlight(i)}
                  style={{
                    backgroundColor: isHighlighted
                      ? "#DBEAFE"
                      : variance
                        ? COLORS.amberBg
                        : "transparent",
                    borderBottom: isExpanded ? "none" : `1px solid ${COLORS.border}`,
                    cursor: hasOverlay ? "pointer" : "default",
                    boxShadow: isHighlighted ? "inset 3px 0 0 #2563EB" : "none",
                    transition: "background-color 150ms ease",
                  }}
                >
                  <td className="py-2.5 pr-2 align-top">
                    <div className="font-medium" style={{ color: COLORS.text }}>
                      {part.name}
                      {hasOverlay && (
                        <span
                          className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full align-middle"
                          style={{ backgroundColor: "#2563EB" }}
                          aria-label="Linked to image overlay"
                        />
                      )}
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
                  <td className="py-2.5 px-2 align-top">
                    <div className="flex flex-wrap gap-1">
                      {part.sources.map((src) => {
                        const meta = SOURCE_META[src];
                        const active = expanded?.row === i && expanded.source === src;
                        return (
                          <button
                            key={src}
                            type="button"
                            data-source-badge
                            onClick={(e) => { e.stopPropagation(); toggleSource(i, src); }}
                            className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold border transition-colors cursor-pointer"
                            style={{
                              backgroundColor: meta.bg,
                              color: meta.fg,
                              borderColor: active ? meta.fg : meta.border,
                            }}
                          >
                            {meta.short}
                          </button>

                        );
                      })}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-right align-top">
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
                {isExpanded && (
                  <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td colSpan={5} className="px-2 pb-3">
                      <CostBreakdownPanel
                        part={part}
                        source={expanded.source}
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

      {/* Documents */}
      {(() => {
        const pr = claimForm?.policeReport ?? "";
        const label =
          pr === "uploaded" ? "Uploaded" :
          pr === "pending" ? "Pending" :
          pr === "not_available" ? "Not Available" :
          "Not Provided";
        const tone =
          pr === "uploaded"
            ? { bg: "#F0FDF4", border: "#BBF7D0", fg: "#15803D", dot: "#16A34A" }
            : { bg: "#FFFBEB", border: "#FCD34D", fg: "#92400E", dot: "#D97706" };
        return (
          <div
            className="shrink-0 rounded-md border px-3 py-2.5"
            style={{ backgroundColor: tone.bg, borderColor: tone.border }}
          >
            <Label>Documents</Label>
            <div className="mt-1.5 flex items-center gap-2 text-xs" style={{ color: COLORS.text }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tone.dot }} />
              <span className="font-semibold">Police Report:</span>
              <span style={{ color: tone.fg }}>{label}</span>
            </div>
            {pr !== "uploaded" && (
              <p className="text-[11px] mt-1.5 leading-snug" style={{ color: tone.fg }}>
                Final authorization paused — manual review required before sign-off.
              </p>
            )}
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

      {/* Senior review banner (preserved) */}
      {seniorReview && (
        <div
          className="shrink-0 rounded-md border px-3 py-2.5"
          style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA" }}
        >
          <div className="text-sm font-semibold" style={{ color: "#991B1B" }}>
            Significant estimate variance detected.
          </div>
          <div className="text-xs mt-1" style={{ color: "#B91C1C" }}>
            Final approval must be completed by an authorized senior adjuster.
          </div>
        </div>
      )}

      {/* Workflow Action Bar */}
      <div className="shrink-0 flex items-center gap-2 pt-1">
        {/* 1. Edit Estimate */}
        <button
          type="button"
          onClick={() => {
            if (editMode) syncDraftValues();
            setEditMode((v) => !v);
          }}
          className="flex-1 rounded-md border py-2.5 text-sm font-semibold transition-colors"
          style={{
            borderColor: COLORS.blue,
            color: editMode ? "white" : COLORS.blue,
            backgroundColor: editMode ? COLORS.blue : "transparent",
          }}
        >
          {editMode ? "Lock Edits ✓" : "Edit Estimate"}
        </button>

        {/* 2. Approve & Submit */}
        {(() => {
          const pr = claimForm?.policeReport ?? "";
          const policeBlocked = pr !== "uploaded";
          const blocked = seniorReview || policeBlocked;
          const blockTitle = seniorReview
            ? "Senior adjuster authorization required before submission."
            : policeBlocked
              ? "Police report pending or unavailable — manual review required before authorization."
              : undefined;
          const label = policeBlocked && !seniorReview ? "Route to Manual Review" : "Approve & Submit";
          return (
            <button
              type="button"
              disabled={seniorReview}
              title={blockTitle}
              onClick={() => {
                if (seniorReview) return;
                if (policeBlocked) {
                  toast.message(`Claim #${claim.id} routed to manual review.`, {
                    description: "Final authorization paused pending police report verification.",
                  });
                  return;
                }
                if (isFastTrack) {
                  toast.success(`Claim #${claim.id} approved and submitted.`, {
                    description: `Estimate authorization issued for ${fmtCurrency(adjustedTotal)}.`,
                  });
                } else {
                  setAuthDialogOpen(true);
                }
              }}
              className="flex-1 rounded-md py-2.5 text-sm font-semibold transition-colors"
              style={{
                backgroundColor: seniorReview ? "#E5E7EB" : policeBlocked ? "#FFFBEB" : COLORS.blue,
                color: seniorReview ? "#9CA3AF" : policeBlocked ? "#92400E" : "white",
                border: policeBlocked && !seniorReview ? "1px solid #FCD34D" : "none",
                cursor: blocked ? (seniorReview ? "not-allowed" : "pointer") : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!seniorReview && !policeBlocked) e.currentTarget.style.backgroundColor = COLORS.blueHover;
              }}
              onMouseLeave={(e) => {
                if (!seniorReview && !policeBlocked) e.currentTarget.style.backgroundColor = COLORS.blue;
              }}
            >
              {label}
            </button>
          );
        })()}


        {/* 3. Generate Report */}
        <button
          type="button"
          disabled={isGeneratingReport}
          onClick={generateReport}
          className="flex-1 rounded-md border py-2.5 text-sm font-semibold transition-colors"
          style={{
            borderColor: COLORS.border,
            color: COLORS.text,
            backgroundColor: "white",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F9FAFB")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
        >
          {isGeneratingReport ? "Generating…" : "Generate Report"}
        </button>
      </div>

      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Authorization</DialogTitle>
            <DialogDescription>
              You are authorizing an estimate of{" "}
              <span className="font-semibold" style={{ color: COLORS.text }}>
                {fmtCurrency(adjustedTotal)}
              </span>{" "}
              for this vehicle. All required verification checks have been completed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setAuthDialogOpen(false)}
              className="rounded-md border px-4 py-2 text-sm font-medium"
              style={{ borderColor: COLORS.border, color: COLORS.text, backgroundColor: "white" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthDialogOpen(false);
                toast.success(`Claim #${claim.id} approved and submitted.`, {
                  description: `Estimate authorization issued for ${fmtCurrency(adjustedTotal)}.`,
                });
              }}
              className="rounded-md px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: COLORS.blue }}
            >
              Confirm Authorization
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
