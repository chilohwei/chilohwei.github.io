---
layout: post
title: "Understanding Skill Workflow: Not a Prompt, but a Delivery System"
summary: A Skill Workflow is not a longer prompt. It turns a one-off output into a recoverable, verifiable, previewable, approvable delivery process. The model handles understanding, judgment, and expression; scripts handle deterministic work; state files handle recovery; evidence, preview, and approval gates move the result from “looks good” to “ready to ship.”
date: "2026-04-27"
categories: "Thought"
---

## TL;DR

After building a delivery-oriented content workflow, my understanding of `Skill Workflow` became much clearer:

**Do not treat it as a longer prompt. Treat it as a small working system.**

A stable workflow needs to answer five questions:

| Question | Solved By |
|---|---|
| When should it start? | Clear trigger conditions |
| What should happen next? | State machine and one next action |
| Which judgments are trustworthy? | Evidence ledger and source references |
| Can the user judge the output? | Readable preview |
| Which actions must not be automatic? | Approval gates and safe delivery |

Models are good at understanding, tradeoffs, and expression. They are not good at owning every deterministic step. Validation, state, format conversion, preview generation, pre-ship checks, and external writes should usually be handled by scripts and gates.

![Skill Workflow Loop](https://chilohdata.s3.bitiful.net/blog/blog/skill-workflow-loop.svg)

This is not about writing a magical prompt. It is about designing a workflow that can actually deliver.

## First, Define the Thing

I used to think of a `Skill` as a prompt enhancement pack.

Write the role, tone, steps, caveats, and output format into `SKILL.md`, then hope the Agent follows it every time.

That works for atomic tasks: summarize an article, rewrite a paragraph, generate a template.

It breaks down once the task becomes multi-stage delivery.

For example, a content workflow may look like “ask AI to write an article,” but the real chain is closer to:

```text
Decide whether the topic is worth writing
  -> Collect evidence and context
  -> Shape the content strategy
  -> Write and revise
  -> Render a preview
  -> Wait for approval
  -> Build the platform draft
  -> Run pre-publish checks
```

Writing is only one step.

The harder part is: how does the system know where it is, what the next step is, what is missing, and when it must stop to ask the user?

Here is the distinction I now use:

| Type | Essence | Good For | Common Mistake |
|---|---|---|---|
| Prompt | One output constraint | Generation, rewriting, summarization | Getting longer until nobody can reason about it |
| Skill | On-demand method pack | Giving the Agent a way to work | Stuffing encyclopedias and scripts into the entry file |
| Workflow | A business process that can move forward | Multi-stage, recoverable, deliverable work | No state, no evidence, no approval |

In one sentence: **a prompt solves one output; a workflow solves one responsibility.**

## A Workflow Has Five Layers

I no longer start by writing `SKILL.md`.

I start by separating layers.

![Skill Workflow Layers](https://chilohdata.s3.bitiful.net/blog/blog/skill-workflow-layers.svg)

| Layer | Owns | Should Not Own |
|---|---|---|
| Entry | Task recognition, required inputs, first step | All domain knowledge |
| Knowledge | Methods, templates, examples, judgment frames | Permanent context pollution |
| Execution | Scripts, checks, conversion, preview rendering | Vibe-based deterministic decisions |
| State | Progress, evidence, decisions, changes | Chat memory as the source of truth |
| Delivery | Preview, approval, publish, rollback | Hidden external side effects |

Not every workflow needs all five layers on day one.

An internal draft or one-off utility may only need a `SKILL.md`.

But once the task touches client delivery, external platforms, multi-person work, or long-lived state, chat context is not enough.

## Models vs Scripts

The most important design decision is what the model should do and what it should not do.

My current split:

| Task | Better for Model | Better for Script |
|---|---|---|
| Understand user goals | Yes | No |
| Judge priority | Yes | No |
| Generate structure and language | Yes | No |
| Check whether files exist | No | Yes |
| Validate required fields | No | Yes |
| Render previews | Partly | Yes |
| Judge evidence sufficiency | Partly | Partly |
| Publish, overwrite, external writes | No | Yes, with approval |

The problem with models is not that they are dumb.

The problem is that they are too good at explaining.

Missing fields become “probably not required yet.” Thin evidence becomes “based on available information.” No preview becomes “the structure is ready.”

A delivery system cannot rely on that elasticity.

A script response like this is far more useful:

```json
{
  "status": "blocked",
  "stage": "data_readiness",
  "summary": "Required production sources are missing.",
  "next_action": "Add brand materials or allow downgrade to draft.",
  "safe_to_continue": false
}
```

It tells the Agent: do not pretend this is done.

## State Prevents Forgetting

Complex workflows cross many turns.

Today the user adds materials. Tomorrow they change direction. The day after tomorrow they ask you to continue. If state only lives in chat, the Agent will eventually guess wrong.

So state should be written down.

A lightweight workspace is already useful:

```text
outputs/[task-id]/
  workflow-state.yaml
  evidence-ledger.yaml
  decision-log.yaml
  change-log.yaml
  preview/
  artifacts/
```

| File | Stores | Why It Matters |
|---|---|---|
| `workflow-state.yaml` | Current stage, blocker, next action | Resume after interruption |
| `evidence-ledger.yaml` | Sources, dates, confidence | Trace key claims |
| `decision-log.yaml` | User approvals and choices | Avoid asking again or changing silently |
| `change-log.yaml` | What changed and why | Review and rollback |
| `preview/` | User-readable output | Approval based on what is visible |

This is not engineering theater.

It keeps the Agent from re-guessing the whole process from a long conversation.

## Three Hard Gates: Evidence, Preview, Approval

I now check a workflow by looking for these gates first.

### 1. Evidence Gate

Key conclusions must trace back to sources.

| Scenario | Evidence Might Be |
|---|---|
| Content strategy | Search volume, competitor pages, user reviews, brand materials |
| Financial analysis | Raw ledgers, account mapping, exchange-rate source |
| Support diagnosis | Tickets, product version, reproduction steps |
| Product requirements | User feedback, business goals, constraints |

Insufficient evidence should downgrade the output to a draft, direction, or hypothesis.

Do not disguise guessing as validation.

### 2. Preview Gate

The user should approve a readable preview, not Markdown, JSON, or a chat summary.

For content, reports, webpages, and CMS drafts, preview is not decoration. It is the decision interface.

### 3. Approval Gate

Publishing, overwriting, deleting, scheduling, or writing to external systems must require explicit confirmation.

Generating a payload does not mean it can be written.

Opening a preview does not mean the user approved publishing.

The stronger the Agent, the clearer the brakes need to be.

## UX Is a Control Protocol

I used to think UX meant “write friendlier replies.”

Now I think of it as the workflow control protocol.

Users do not care how many scripts or state files exist internally.

They care about four things:

| User Question | Good Response |
|---|---|
| Where are we? | Name the current stage, not every internal detail |
| Why are we blocked? | Explain impact before internals |
| Can I trust this? | Show evidence state and risks |
| What do I do next? | Give one clear next action |

A good workflow reply should:

- Answer direct questions directly.
- Serve one scene per reply.
- Explain failure impact before recovery.
- Stop when user judgment is required.
- Prefer one next step over a menu of options.

This is not copywriting polish. It is a permission boundary.

## Five Patterns I Reuse

| Pattern | Solves |
|---|---|
| One-next-action arbiter | Tells the Agent exactly what to do now |
| Evidence ledger | Keeps claims tied to source, date, confidence |
| Preview as gate | User approves visible output, not chat summaries |
| Self-healing config | Create templates and ask only for fields needed now |
| Safe publish adapter | Build payload → validate → preview → confirm → write |

These are patterns, not a full-stack mandate.

The more you turn on, the longer the references, the more fragmented the path, and the higher the token cost.

My rule is: **add the module that controls the real risk.**

## Nine Questions Before Designing

If I were designing a Skill Workflow from scratch today, I would ask:

1. What does this workflow ultimately deliver?
2. Who uses it?
3. Where do users most often get stuck?
4. Which steps can the model judge?
5. Which steps must be scripted?
6. Which intermediate artifacts must be persisted?
7. What data is required for production?
8. Which actions have external side effects and require approval?
9. How does the system recover after interruption, failure, or revision?

Only after that would I shape the directory:

```text
your-skill-workflow/
  SKILL.md
  references/
    operating-principles.md
    workflow-stages.md
    preview-and-approval.md
  scripts/
    workflow_start.mjs
    workflow_next.mjs
    validate_evidence.mjs
    render_preview.mjs
    delivery_validate.mjs
  assets/
    templates/
```

The point is not a pretty directory.

The point is clear responsibility:

- `SKILL.md` is entry and navigation.
- `references/` holds detailed rules and examples.
- `scripts/` owns deterministic actions.
- `assets/` holds templates and reusable materials.
- State files record progress, evidence, decisions, and changes.

Do not put everything into one giant `SKILL.md`.

That is not memory. That is context pollution.

## Finally

`MCP` lets the Agent touch the real world.

`Skills` teach it a way of working.

`CLI` lets it execute, verify, revise, and execute again.

`Skill Workflow` organizes those pieces into a deliverable business process.

It helps AI know:

- Which stage it is in.
- Which information is trustworthy.
- Which actions can continue.
- Which actions must stop.
- How the result becomes visible.
- How external side effects are confirmed.

A prompt solves one output.

A workflow solves one responsibility.

Once AI starts carrying responsibilities, the real design question is no longer “how do we make it answer better?”

It is:

**How do we help it do the work correctly in the real world?**
