# Insurance Claims Portal

A vehicle damage claims review prototype demonstrating automated assessment support, transparent repair estimate generation, and risk-based routing for claims agents.

This prototype was designed to show how AI-assisted assessment can reduce adjuster workload while maintaining transparency, auditability, and human accountability.

---

## What This Demonstrates

Most vehicle claims workflows rely on manual review of submitted damage photos, repair cost estimation, and approval decisions. This prototype demonstrates how a claims agent can move from photo submission to draft assessment, estimate review, and authorization through a transparent and structured workflow.

Rather than automatically approving or rejecting claims, the system generates a draft assessment, surfaces supporting evidence and simulated repair-cost references, and recommends the appropriate level of review based on claim complexity and repair uncertainty. The system also exposes the cost sources and routing rationale behind each recommendation so adjusters can understand and challenge the output.

Six-step workflow across two phases:

```text
CLAIM SUBMISSION (Policyholder)        CLAIMS REVIEW (Agent)
─────────────────────────────          ─────────────────────────────────
Step 1: Submit Claim                   Step 4: Draft Assessment
Step 2: Upload Photos                  Step 5: Claims Agent Review
Step 3: Claim Submitted                Step 6: Session Summary (Demo)
Three assessment and review outcomes:

State	Trigger	Agent Action
Fast-Track	High photo clarity, low value, no structural flags	Review complete with minimal friction and no escalation
Verification Required	Uncertain damage scope or moderate value	Flagged concerns are surfaced for adjuster acknowledgement
Senior Authorization	Structural involvement or high estimated value	Claim is prepared and submitted for senior sign-off

Key design decisions:

Uncertainty is localized to specific estimate lines, not expressed as a single aggregate score.
Every cost line includes source context so the adjuster can understand the basis of the recommendation.
Estimate adjustments require a categorized rationale before submission and are recorded in the claim history.
Coverage eligibility and claim context are captured at intake before any damage assessment begins.
The policy deductible is auto-retrieved from the policy record after policy number entry.
For demonstration purposes, the prototype includes three predefined review scenarios illustrating different assessment outcomes and review paths.
Tech Stack

Built using Lovable, an AI-assisted development tool.

The exported project includes a TypeScript/Vite application structure, Bun dependency management, generated routing files, reusable UI components, and global CSS styling. Exact dependencies are defined in package.json and bun.lock.

Prerequisites

Install Bun v1.0 or higher.

curl -fsSL https://bun.sh/install | bash
Getting Started

1. Clone the repository

git clone https://github.com/amanielabed/Insurance-Claims-Portal-
cd insurance-claims-portal

2. Install dependencies

bun install

3. Start the development server

bun dev

Open:

http://localhost:3000
Running the Demo
Option A — Use Demo Claim (Recommended)

When Step 5 loads, click Use Demo Claim. This loads a pre-configured claim and takes you directly into the Claims Agent Review cockpit with data pre-populated.

Use the scenario selector to switch between the three demo states:

Scenario	Demonstrates
Fast-Track Approval	Low-friction review with no escalation
Verification Required	Flagged concerns that require adjuster acknowledgement
Senior Authorization Required	High-value or structural claim requiring senior sign-off

Key interactions to demonstrate:

Click any cost basis badge to view the cost breakdown for a line item.
Open the routing basis panel to see the signals used to determine the delegation state.
Edit any estimate line and select a rationale category before submitting.
Use Save and Request Information to document a photo or document request.
For Senior Authorization, click Submit for Senior Authorization and confirm.

Once all three scenarios are submitted or completed, the system automatically advances to Step 6 — Session Summary, where you can generate the consolidated session report.

Option B — Full Workflow: Steps 1 to 6
Step 1 — Submit Claim

Enter a valid demo policy number to auto-retrieve vehicle details.

Complete the coverage eligibility check, incident context, and claim details. Upload or confirm police report status if another party was involved.

Step 2 — Upload Photos

Upload a minimum of three damage photos. The photo sufficiency gate prevents assessment from starting until enough photo coverage is provided.

Photos should be:

In focus
Well lit
Unobstructed
Taken from multiple angles
Step 3 — Claim Submitted

The confirmation screen appears. Click Open Claim for Review to move into the agent review phase.

Step 4 — Draft Assessment

The prototype generates a simulated draft assessment using damage assessment outputs and repair-cost references. It then advances to the claims agent review screen.

Step 5 — Claims Agent Review

Review, edit, and submit estimates across the demo scenarios as described in Option A.

Step 6 — Session Summary

The session summary displays the demo scenarios and their review statuses. Click Generate Session Summary Report to download the consolidated PDF.

Note: the session summary does not constitute claim closure. Items pending senior authorization or awaiting information require follow-up before repair authorization can be issued.

In a production system, a single claim would follow one review path. Step 6 exists in the demo to show multiple possible review outcomes in a single walkthrough.

Build for Production
bun run build

Preview locally:

bun run preview
Project Structure
src/
├── routes/
│   ├── __root.tsx        # Root layout and global providers
│   └── index.tsx         # Full application and six-step workflow
├── components/
│   └── ui/               # Reusable UI components
├── hooks/                # Shared hooks
├── lib/
│   └── utils.ts          # Utility functions
└── styles.css            # Global styles

All application logic, workflow state, demo scenarios, and PDF generation are contained in:

src/routes/index.tsx
Key Product Decisions
Why add routing on top of assessment?

The assignment asks for damage assessment, estimate generation, and approval. The delegation routing layer addresses the approval step by routing each claim to the appropriate level of review rather than treating all claims equally.

This makes the review process more structured, explainable, and auditable.

Why is Fast-Track not touchless?

Fast-Track means low-friction review, not automatic approval. The adjuster still reviews the draft estimate before submitting. Human review is required across all delegation states.

Why require adjustment rationale?

Every estimate adjustment is a signal that the draft assessment diverged from adjuster judgment. Capturing the reason creates a structured audit trail and supports future estimate quality improvement.

Why generate the report at Step 6?

A report generated mid-session would be incomplete. Step 6 ensures the report reflects the current status of reviewed scenarios, including items that are complete, awaiting information, or pending senior authorization.

Why auto-retrieve the deductible?

The deductible is a policy attribute, not information the adjuster should manually enter. Auto-retrieval reduces data-entry friction and prevents avoidable errors.

Scope and Limitations

This is a functional prototype with simulated assessment responses.

In a production implementation:

The draft assessment would be replaced with live computer vision inference.
Repair-cost estimates would use real-time repair-cost database integrations.
Policy lookup would connect to a live policy management system.
Adjustment rationale data would support estimate quality monitoring.
The session summary would integrate with a core claims management system.

Out of scope for this prototype:

Third-party liability claims
Multi-vehicle incidents
Injury claims
Repair shop authorization
Repair network integration
Price negotiation workflows
Policyholder-facing claim status tracking
Total loss determination
Fraud detection
Core carrier system integrations

The workflow is limited to own-vehicle damage claims under full coverage policies.
