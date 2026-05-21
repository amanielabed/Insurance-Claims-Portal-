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
    <div className="min-h-screen text-white" style={{ backgroundColor: "#0F1117" }}>
      <header
        className="flex items-center justify-between px-6 py-4 border-b border-white/5"
        style={{ backgroundColor: "#1A1D27" }}
      >
        <h1 className="text-lg font-semibold tracking-tight">
          Claims Delegation Cockpit
        </h1>
        <select
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-white/10 focus:outline-none focus:ring-2"
          style={{
            backgroundColor: "#0F1117",
            color: "white",
            // @ts-expect-error css var
            "--tw-ring-color": "#4F6EF7",
          }}
        >
          {CLAIMS.map((c) => (
            <option key={c.id} value={c.id} style={{ backgroundColor: "#1A1D27" }}>
              {c.label}
            </option>
          ))}
        </select>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <Panel title="Damage Photo">
          <div
            className="flex items-center justify-center h-80 rounded-md border border-dashed border-white/10 text-sm text-white/40"
            style={{ backgroundColor: "#0F1117" }}
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
      className="p-5 rounded-lg border border-white/5"
      style={{ backgroundColor: "#1A1D27" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-4 rounded-sm" style={{ backgroundColor: "#4F6EF7" }} />
        <h2 className="text-sm font-medium uppercase tracking-wider text-white/80">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
