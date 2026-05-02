---
layout: post
title: "Skill Workflow: Don't Write a Longer Prompt—Design a Working System"
summary: After shipping a content-oriented, delivery-heavy Agent workflow end to end, one thing is clear—high-quality Skill Workflows are not longer prompts but deliverable systems: models judge and express; scripts and state handle determinism, recovery, and audit. Gates and docs must match real needs; overbuilding slows you down and burns tokens on long references and check chains.
date: "2026-04-27"
categories: "Thought"
---

> This piece makes one claim: **a high-quality Skill Workflow is not a longer prompt—it is a working system.** Models handle understanding and creation; scripts handle validation, state, and pre-ship checks; state machines make flows resumable and auditable.
>
> Whether results are good rarely comes down to “whether the AI can write.” It comes down to **whether the system can deliver.** A **working system** is also **not** “run every possible check”—the depth of gates and references has to match real risk and real pace, or you become your own bottleneck.

While turning a long-chain workflow—**content strategy → writing → preview → multi-platform publishing**—into something real, my read on `Skill Workflow` got clearer.

At first it is tempting to treat it as “write a more detailed prompt.”

Stuff role, tone, steps, caveats, and output format into one `SKILL.md` and hope the Agent follows it every time.

After you run a serious multi-stage flow once, that path hits a wall fast.

In real work the problem is never only “generate some copy.”

The real questions are:

- Is the user’s goal clear?
- Is the data trustworthy enough?
- Where can the model decide?
- Where must scripts verify?
- Can outputs be previewed?
- Do publish, overwrite, and write actions have approval?
- Can you resume after interruption?
- Can you trace what went wrong?

Longer prompts do not fix these—only system design does.

## I. From writing content to driving the process

Take a **content + multi-platform delivery** workflow: on the surface it is content production.

What it really has to solve is not “have AI write one article.”

Any large model can write an article.

What is hard is:

```text
Decide if the topic is worth writing
  -> Gather real data
  -> Shape content strategy
  -> Write and refine
  -> Prepare images and media list
  -> Render HTML preview
  -> Wait for user approval
  -> Build WordPress / Shopify draft bundles
  -> Pre-publish validation
```

In that chain, writing is only one step.

Often it is not even the hardest step.

Harder is: **how the system knows what it should do now, what it must not do, and when it must stop and wait for the user.**

That is the main takeaway this round:

**Do not treat the Agent as “a model that writes.” Design it as “an OS that moves a business process forward.”**

Once you flip that lens, the design questions change.

You stop asking only “how to write a better prompt” and start asking:

- What does this workflow ultimately deliver?
- Who uses it?
- Which steps need real data?
- Which actions have external side effects?
- Which outputs must be previewable?
- Which decisions must be recorded?
- What should the user see when something fails?

That is where workflow design starts.

## II. Seven traits of a high-standard workflow

A plain Skill usually solves one atomic task.

PDF handling, summaries, calling an API, format conversion.

A high-standard `Skill Workflow` spans stages, tools, and decisions.

I use seven traits as a checklist:

**First, invocable.**  
Natural-language goals should route to it reliably—not exotic commands users must memorize.

**Second, executable.**  
Users should not need deep internals; the Agent advances most steps on its own.

**Third, verifiable.**  
Critical stages need more than “looks fine”—scripts, files, state, tests, or previews that make trust explicit.

**Fourth, resumable.**  
After interruption, continue from state on disk—not from chat memory.

**Fifth, previewable.**  
Anything that affects the user’s judgment should be visible.

**Sixth, auditable.**  
Data provenance, approvals, automated edits, and publish actions should leave a trail.

**Seventh, deliverable.**  
It cannot end at “here is some advice.” It should reach a draft bundle, a platform draft, a client artifact, or at least a local artifact you can inspect.

Together, these traits push `Skill Workflow` toward a lightweight product system—not prompt stacking.

They are also an **upper bound**, not a mandate for v1. Weekly blurbs, internal drafts, or “someone will skim it” work do not need the full stack—**end-to-end evidence + layered doctor runs + every reference doc**. Over-gating slows the main line; the Agent keeps loading long docs and chaining checks; context swells; **a lot of tokens go to keeping the machinery running, not to delivery quality.**

Before you design, pick the priority: do you fear **unreliability** more, or **too slow / too expensive (including model cost)**? Lock down the worst risk first; add gates after incidents and feedback—not on day one from a textbook outline.

## III. Models judge; scripts enforce determinism

The important split is roles: what the model does vs what scripts do.

Models are strong at:

- Parsing natural-language goals.
- Judging context and priority.
- Structuring content, writing, explaining.
- Choosing among reasonable options.
- Explaining state in human terms.

Models should not own everything.

Anything stable, repeatable, testable—anything you cannot leave to vibe—belongs in scripts.

For example:

- Initialize workspaces.
- Decide the next step.
- Check configuration.
- Validate evidence.
- Render previews.
- Build platform payloads.
- Run pre-publish checks.
- Lint replies so internal detail does not leak.

A good script behaves like a small API.

No interactive prompts; clear flags; `--help`; stable JSON or stable text; failures that name the blocker and how to recover.

It might tell the Agent:

```json
{
  "status": "blocked",
  "stage": "data_readiness",
  "summary": "External data source credentials are missing or invalid.",
  "one_next_action": "Add the required API credentials to the workflow secrets file on disk (do not paste into chat).",
  "safe_to_continue": false
}
```

That looks like engineering trivia; it directly shapes UX.

Many Agent replies are not invented—they are assembled from those stable states.

**The more stable the scripts, the less room for the Agent to improvise badly.**

Balance matters too: **each extra check is another read/write/wait cycle.** Pin scripts to **irreversible actions** and **places that have actually failed before**, rather than a full diagnostic every time—that is the same line of reasoning as the **upper-bound checklist** in the previous section.

## IV. State machines as memory for complex flows

Complex workflows cannot live on chat memory alone.

When stages multiply and edits loop, persisted state earns its keep; when approvals, external writes, or multi-person work appear, logs and decision records belong earlier—not to look “professional,” but for **resumability and traceability**.

In projects like this, a workspace for one business object (brand, client, etc.) might look like:

```text
outputs/[entity-slug]/
  profile.yaml
  workflow-state.yaml
  evidence-ledger.yaml
  decision-log.yaml
  change-log.yaml
  credentials-status.json
  data/
  content-assets/
```

They solve concrete problems:

- After interruption, the system knows where to continue.
- The Agent cannot skip prerequisite gates.
- Approvals and rejections are recorded.
- Conclusions trace back to data.
- Multiple brands or projects stay isolated.

Often the Agent fails not because it is “dumb” but because the flow never gave it a reliable source of state.

If it can only guess from context, it will guess wrong.

State files turn the workflow from a **temporary chat process** into a **durable process on disk**.

## V. Evidence, preview, approval: three hard gates

Content, reports, analysis, GTM, legal work—all share one failure mode:

**Do not pass “a guess” off as “validated.”**

This section assumes **external delivery, compliance, or accountability**: when consequences exist outside the chat, evidence cannot be hand-wavy; scratch notes and experiments can still use the proportionality from section II. On that basis, a serious workflow earns an evidence gate.

No evidence → no final call.

Thin evidence → downgrade to diagnosis, direction, or draft.

Solid evidence → production.

Examples of evidence: search volume and peers for content; ledgers and FX sources for finance; tickets and repro steps for support.

Different domains, same rule:

**Key conclusions must trace to sources.**

Beyond evidence: preview gates.

Markdown, YAML, or JSON can be source files; what users approve should be a **readable preview**.

For content, reports, web, CMS drafts, preview is not decoration—it is the decision surface.

Then approval gates.

Publish, overwrite, delete, schedule, writes to external systems—each needs explicit confirmation.

Opening a preview is not approving a publish.

Building a payload is not permission to write upstream.

That line must stay crisp.

The stronger the Agent, the clearer the brakes.

## VI. UX is not polish—it is a control protocol

I used to treat UX as friendly wording.

Now I treat it as part of the workflow’s control protocol.

Users do not care about `workflow_start.mjs`, `workflow_next.mjs`, or `evidence-ledger.yaml`.

They care:

- Where am I blocked?
- What did the Agent do?
- Can I trust this?
- What is the single next step?

So a good workflow reply does not dump internal complexity on the user.

A few simple rules:

**Direct question → direct answer.**  
If they ask where the config file is, give the path—not an eight-step tour.

**One reply, one scenario.**  
Install, diagnose, produce, approve, ship—do not mash them together.

**One reply, one next step.**  
People rarely need more options; they need to know what to do now.

**On failure: impact first, then recovery.**  
No wall of stack trace; no blaming the user first.

**Approval gates mean stop.**  
When judgment belongs to the user, do not decide for them.

That is not copywriting—it is system boundary.

Without engineering UX, an Agent easily oversteps while “looking helpful.”

## VII. Five patterns worth reusing

Abstracted one level up, these travel across industries.

**Single-next-step arbiter.** Scripts derive state into **one** action so each turn does not drown the user in options.

**Evidence ledger.** Conclusions tie to source, time, raw material, and confidence—strategy, research, reports alike.

**Preview as gate.** Markdown/YAML can be sources; approval UI is the preview—users approve the preview, not the chat summary.

**Config self-heal.** Missing config → scaffold templates; missing fields → only the group needed for this goal; secrets stay local, never in chat.

**Safe publish adapter.** External writes split into: build payload → validate → preview → dry-run or draft → explicit approval → write. Same idea for CMS, email, DBs.

This is a **pattern library**, not a mandatory checklist. **The more you enable, the longer references get and the more paths fragment—slower and more tokens by default.** Trim to scenario; do not deploy the whole catalog every time.

## VIII. If you were building a workflow from scratch

I would not start with `SKILL.md`.

I would answer nine questions first:

1. What does this workflow ultimately deliver?
2. Who uses it?
3. Where do users get stuck?
4. Which steps can the model judge?
5. Which steps must be deterministic in scripts?
6. Which intermediate artifacts must hit disk?
7. Which data is required for “real” production?
8. Which actions have side effects and need approval?
9. After interrupt, failure, or edits—how does the system recover?

Only then unpack structure.

A mature-ish layout might look like:

```text
your-skill-workflow/
  SKILL.md
  references/
    operating-principles.md
    user-experience.md
    configuration.md
    data-sources.md
    workflow-stages.md
    preview-and-approval.md
    publishing-or-delivery.md
  scripts/
    workflow_start.mjs
    workflow_next.mjs
    state_init.mjs
    data_readiness.mjs
    validate_evidence.mjs
    render_preview.mjs
    artifact_manifest.mjs
    delivery_validate.mjs
    workflow_doctor.mjs
    response_lint.mjs
  assets/
    templates/
```

Not every workflow needs the full tree.

Atomic tasks might need only `SKILL.md`.

Multi-stage flows should at least have `references/operating-principles.md` and state scripts.

Anything touching external platforms needs dry-run, payload validation, and approval gates.

Non-technical users need guided setup and runtime self-checks.

Delivery or customer-facing work often adds doctor, tests, and review loops—but **keep doctor disciplined** (same logic as the **upper bound** in section II and the **pattern library** in section VII): good for package shape, fatal misconfig, and hard gates before external writes; if validation fragments into tiny steps, users wait on checkmarks while the Agent keeps swallowing `references` and diagnostic output—tokens burn on the process itself. Prefer light checks or fold steps together.

What matters is not a pretty tree but clear layers whose depth matches risk.

`SKILL.md` is the entry and signpost.

`references/` holds the detailed rules.

`scripts/` holds deterministic actions.

`assets/` holds templates and reusable material.

Do not cram everything into one giant `SKILL.md`—that is context pollution, not leverage.

The flip side still bites: chat-only memory, shipping a so-called final without data, treating preview as approval—you are leaving determinism to luck. Put it in scripts, state, and gates—not only in prose.

## IX. From prompt to workflow: a dividing line for productizing AI

Zoom out and this lines up with how I think about **`MCP -> Skills -> CLI`**.

`MCP` solves access.

`Skills` solve competence.

`CLI` solves the loop.

`Skill Workflow` wires those into a **deliverable business process**.

It is not mainly about making AI more eloquent.

It is about making AI know:

- Which stage it is in.
- Which capability to invoke.
- When to continue.
- When to stop.
- What to trust.
- What needs approval.

From that angle, moats in AI products may not be models alone.

Models matter.

What may matter as much is the working system around them:

```text
Clear trigger entry
  -> Progressively loaded knowledge
  -> Explicit state machine
  -> Deterministic scripts
  -> Auditable evidence
  -> Previewable artifacts
  -> User approval gates
  -> Safe delivery and review
```

That chain is a **map**, not a mandate to build everything at once: **add modules as risks show up**—iterative beats big-bang.

It is less flashy than raw model capability.

It is what lets AI move from **answering questions** to **carrying responsibility**.

Prompts optimize one output.

Workflows optimize an ongoing duty.

When AI starts owning duties, the design question stops being only “how to make it answer better.”

It becomes:

**How to help it get the real-world job right.**
