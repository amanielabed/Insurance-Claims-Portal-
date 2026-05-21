import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

const CLAIMS = [
  { id: "2026-001", label: "Claim #2026-001 — Simple Scratch" },
  { id: "2026-002", label: "Claim #2026-002 — Rear Collision" },
];

function Index() {
  const [claim, setClaim] = useState(CLAIMS[0].id);

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
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-0"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#1F2937",
              borderColor: "#D1D5DB",
            }}
          >
            {CLAIMS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="flex-1 min-h-0 grid grid-cols-3 gap-4 p-4">
        <Panel title="Damage Photo">
          <div
            className="flex items-center justify-center h-full rounded-md border border-dashed text-sm"
            style={{
              backgroundColor: "#F1F5F9",
              borderColor: "#CBD5E1",
              color: "#64748B",
            }}
          >
            Photo placeholder
          </div>
        </Panel>
        <Panel title="AI Assessment" />
        <Panel title="Estimatics Review" />
      </main>
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
      <div className="flex-1 min-h-0 p-4">{children}</div>
    </section>
  );
}
