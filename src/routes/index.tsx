import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
  delegationState: "FAST_TRACK" | "MANUAL_REVIEW";
  reviewConfidence: "High" | "Moderate" | "Low";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  estimatedCost: number;
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

const STEPS = [
  "Initiate Claim",
  "Upload Photos",
  "Draft Assessment",
  "Review Estimate",
] as const;

function Index() {
  const [step, setStep] = useState(1);

  return (
    <div
      className="flex flex-col h-screen"
      style={{ backgroundColor: COLORS.bg, color: COLORS.text }}
    >
      <StepIndicator current={step} />
      <div key={step} className="flex-1 min-h-0 flex flex-col animate-fade-in">
        {step === 1 && <InitiateClaimStep onContinue={() => setStep(2)} />}
        {step === 2 && (
          <UploadPhotosStep
            onContinue={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && <DraftAssessmentStep onComplete={() => setStep(4)} />}
        {step === 4 && <ReviewEstimateStep />}
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
  { id: "front", name: "Front View", guidance: "Full front of vehicle", required: true, icon: "▲" },
  { id: "rear", name: "Rear View", guidance: "Full rear of vehicle", required: true, icon: "▼" },
  { id: "driver", name: "Driver Side", guidance: "Full left side", required: true, icon: "◀" },
  { id: "passenger", name: "Passenger Side", guidance: "Full right side", required: true, icon: "▶" },
  { id: "damage", name: "Primary Damage Close-Up", guidance: "Close photo of the main damaged area", required: true, icon: "◎" },
  { id: "secondary", name: "Secondary Damage Detail", guidance: "Additional damage areas", required: false, icon: "◇" },
  { id: "interior", name: "Interior Damage", guidance: "Cabin or interior damage", required: false, icon: "▣" },
  { id: "odometer", name: "Odometer / Dashboard", guidance: "Mileage and dashboard view", required: false, icon: "◐" },
];

function UploadPhotosStep({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleSelect = (slotId: string, file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotos((prev) => ({ ...prev, [slotId]: url }));
  };

  const required = PHOTO_SLOTS.filter((s) => s.required);
  const optional = PHOTO_SLOTS.filter((s) => !s.required);
  const uploadedRequired = required.filter((s) => photos[s.id]);
  const uploadedCount = uploadedRequired.length;
  const missing = required.filter((s) => !photos[s.id]);
  const sufficient = uploadedCount === required.length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Upload Photos</h2>
          <p className="text-sm mt-1" style={{ color: COLORS.muted }}>
            Capture multiple angles to enable a complete draft assessment.
          </p>
        </div>

        {/* Requirements panel */}
        <div
          className="rounded-lg border p-4 mb-5"
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold" style={{ color: COLORS.text }}>
                Draft Assessment Requires 5 Minimum Photos
              </h3>
              <div className="relative">
                <button
                  type="button"
                  onMouseEnter={() => setTooltipOpen(true)}
                  onMouseLeave={() => setTooltipOpen(false)}
                  onFocus={() => setTooltipOpen(true)}
                  onBlur={() => setTooltipOpen(false)}
                  aria-label="Why 5 photos?"
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
                    <span className="font-semibold">Why 5 photos?</span> Single-angle assessment increases the risk of missing structural damage. Multi-angle coverage helps cross-check damage patterns and flag inconsistencies.
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
              {uploadedCount} of {required.length} required photos uploaded
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: "#F3F4F6" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(uploadedCount / required.length) * 100}%`,
                backgroundColor: sufficient ? COLORS.green : COLORS.blue,
              }}
            />
          </div>
        </div>

        {/* Required photo slots */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
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
            className="rounded-md border px-4 py-3 mb-5 flex items-center gap-2 animate-fade-in"
            style={{ backgroundColor: COLORS.greenBg, borderColor: "#BBF7D0", color: COLORS.greenText }}
          >
            <span>✓</span>
            <span className="text-sm font-medium">
              Sufficient photo coverage detected. Draft assessment is ready to begin.
            </span>
          </div>
        ) : uploadedCount >= 3 ? (
          <div
            className="rounded-md border px-4 py-3 mb-5 text-sm animate-fade-in"
            style={{ backgroundColor: COLORS.amberBg, borderColor: COLORS.amberBorder, color: COLORS.amberText }}
          >
            ⚠ {required.length - uploadedCount} more photo{required.length - uploadedCount === 1 ? "" : "s"} required before assessment can begin. Missing: {missing.map((s) => s.name).join(", ")}.
          </div>
        ) : (
          <div
            className="rounded-md border px-4 py-3 mb-5 text-sm animate-fade-in"
            style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA", color: "#991B1B" }}
          >
            Insufficient photo coverage. Multiple angles are required to assess structural integrity and reduce single-angle assessment errors.
          </div>
        )}

        {/* Optional section */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold mb-1" style={{ color: COLORS.text }}>
            Additional Photos <span style={{ color: COLORS.muted }}>(Recommended)</span>
          </h3>
          <p className="text-xs mb-3" style={{ color: COLORS.muted }}>
            Optional — but strengthens the assessment when included.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {optional.map((slot) => (
              <PhotoCard
                key={slot.id}
                slot={slot}
                previewUrl={photos[slot.id]}
                onSelect={(f) => handleSelect(slot.id, f)}
              />
            ))}
          </div>
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
] as const;

interface ClaimForm {
  policyNumber: string;
  fullName: string;
  dateOfLoss: string;
  contactPhone: string;
  incidentType: string;
  description: string;
  location: string;
  injured: boolean;
  year: string;
  make: string;
  model: string;
  vin: string;
}

const emptyForm = (): ClaimForm => ({
  policyNumber: "",
  fullName: "",
  dateOfLoss: new Date().toISOString().slice(0, 10),
  contactPhone: "",
  incidentType: "",
  description: "",
  location: "",
  injured: false,
  year: "",
  make: "",
  model: "",
  vin: "",
});

const demoForm = (): ClaimForm => ({
  policyNumber: "POL-2026-48201",
  fullName: "Jordan M. Whitaker",
  dateOfLoss: new Date().toISOString().slice(0, 10),
  contactPhone: "(415) 555-0142",
  incidentType: "Rear-end collision",
  description:
    "Vehicle was struck from behind at a stoplight on Market St. Visible damage to rear bumper and trunk area. No airbag deployment.",
  location: "Market St & 5th Ave, San Francisco, CA",
  injured: false,
  year: "2022",
  make: "Toyota",
  model: "Camry SE",
  vin: "4T1G11AK5NU712398",
});

function InitiateClaimStep({ onContinue }: { onContinue: () => void }) {
  const [form, setForm] = useState<ClaimForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ClaimForm, string>>>({});

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
    if (!form.description.trim()) next.description = "Brief description is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onContinue();
  };

  const charCount = form.description.length;

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
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
              placeholder="POL-2026-XXXXX"
              invalid={!!errors.policyNumber}
            />
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
          <Field label="Incident Type" required error={errors.incidentType}>
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
          <Field label="Was anyone injured?" className="md:col-span-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={form.injured}
                onClick={() => update("injured", !form.injured)}
                className="relative inline-flex h-6 w-11 rounded-full transition-colors"
                style={{
                  backgroundColor: form.injured ? COLORS.amber : "#D1D5DB",
                }}
              >
                <span
                  className="inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform"
                  style={{ transform: form.injured ? "translateX(22px)" : "translateX(2px)", marginTop: 2 }}
                />
              </button>
              <span className="text-sm" style={{ color: COLORS.text }}>
                {form.injured ? "Yes" : "No"}
              </span>
            </div>
            {form.injured && (
              <div
                className="mt-3 rounded-md border px-3 py-2 text-xs animate-fade-in"
                style={{
                  backgroundColor: COLORS.amberBg,
                  borderColor: COLORS.amberBorder,
                  color: COLORS.amberText,
                }}
              >
                ⚠ Claims involving injuries require senior adjuster review.
              </div>
            )}
          </Field>
        </FormSection>

        <FormSection title="Vehicle Information">
          <Field label="Year">
            <TextInput
              type="number"
              value={form.year}
              onChange={(v) => update("year", v)}
              placeholder="2024"
            />
          </Field>
          <Field label="Make">
            <TextInput
              value={form.make}
              onChange={(v) => update("make", v)}
              placeholder="Toyota"
            />
          </Field>
          <Field label="Model">
            <TextInput
              value={form.model}
              onChange={(v) => update("model", v)}
              placeholder="Camry"
            />
          </Field>
          <Field label="VIN">
            <TextInput
              value={form.vin}
              onChange={(v) => update("vin", v)}
              placeholder="Optional"
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
  placeholder,
  type = "text",
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  invalid?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-10 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      style={{
        borderColor: invalid ? "#DC2626" : "#D1D5DB",
        backgroundColor: COLORS.surface,
        color: COLORS.text,
      }}
    />
  );
}

function ReviewEstimateStep() {
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

function SourceDetail({ source }: { source: SourceKey }) {
  const meta = SOURCE_META[source];
  const content: Record<SourceKey, React.ReactNode> = {
    mitchell: (
      <>
        <DetailRow label="Labor benchmark" value="$95/hr regional labor average" />
        <DetailRow label="Estimated repair time" value="1.5 hours for comparable bumper damage" />
        <DetailRow label="Last updated" value="March 2026" />
        <DetailRow label="Reference quality" value="High match confidence for this vehicle category." />
      </>
    ),
    ccc: (
      <>
        <DetailRow label="Part reference" value="Rear bumper cover" />
        <DetailRow label="OEM price" value="$340" />
        <DetailRow label="Aftermarket option" value="$187" />
        <DetailRow label="Suggested repair scope" value="Aftermarket replacement meets cosmetic repair standards" />
        <DetailRow label="Supplier availability" value="Available through approved regional suppliers." />
      </>
    ),
    oem: (
      <>
        <DetailRow label="Reference" value="Toyota Structural Repair Manual (2024 revision)" />
        <DetailRow label="Procedure reference" value="Bumper repair and paint calibration guidance" />
        <DetailRow label="Additional note" value="Paint calibration may be required for metallic finishes." />
      </>
    ),
    verify: (
      <>
        <p className="text-xs leading-relaxed" style={{ color: COLORS.text }}>
          A direct database match was not identified for this damage pattern.
        </p>
        <p className="text-xs leading-relaxed mt-1.5" style={{ color: COLORS.text }}>
          The estimate was generated using comparable repair scenarios and regional pricing references.
        </p>
        <p className="text-xs leading-relaxed mt-1.5 font-medium" style={{ color: meta.fg }}>
          Additional adjuster verification is recommended before authorization.
        </p>
      </>
    ),
  };
  return (
    <div
      className="rounded-md border p-3 animate-fade-in"
      style={{ backgroundColor: meta.bg, borderColor: meta.border }}
    >
      <div className="text-xs font-semibold mb-1.5" style={{ color: meta.fg }}>
        {source === "oem" ? "Manufacturer Repair Guidelines" : meta.label}
      </div>
      <div className="flex flex-col gap-1">{content[source]}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-xs leading-snug">
      <span className="font-medium" style={{ color: COLORS.muted }}>{label}: </span>
      <span style={{ color: COLORS.text }}>{value}</span>
    </div>
  );
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
                className="text-left font-semibold uppercase tracking-wider text-[10px] pb-2 px-2"
                style={{ color: COLORS.muted }}
              >
                Cost Basis
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
              return (
                <Fragment key={i}>
                <tr
                  style={{
                    backgroundColor: variance ? COLORS.amberBg : "transparent",
                    borderBottom: isExpanded ? "none" : `1px solid ${COLORS.border}`,
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
                  <td className="py-2.5 px-2 align-top">
                    <div className="flex flex-wrap gap-1">
                      {part.sources.map((src) => {
                        const meta = SOURCE_META[src];
                        const active = expanded?.row === i && expanded.source === src;
                        return (
                          <button
                            key={src}
                            type="button"
                            onClick={() => toggleSource(i, src)}
                            className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold border transition-colors"
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
                {isExpanded && (
                  <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td colSpan={5} className="px-2 pb-3">
                      <SourceDetail source={expanded.source} />
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
