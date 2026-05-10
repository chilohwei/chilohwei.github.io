---
layout: post
title: "The Hard Part of Multi-Agent Systems Is Organization Design"
summary: Multi-agent systems are not about running several models side by side. They are about organizing tasks, context, roles, memory, permissions, and acceptance into a collaborative system. Channel is the workbench, Main Agent governs, Worker Agents deliver professionally, and Task Subagents handle bounded temporary work. Once boundaries are clear, Agents can move from occasional brilliance to steady reliability.
date: "2026-05-10"
categories: "Thought"
---

## TL;DR

After organizing a multi-agent collaboration architecture, one judgment became very clear:

**The point of multi-agent systems is not to make more models work at the same time. It is to design an organization system that can collaborate, recover, validate, and be audited.**

If you simply start multiple Agents and let them message each other, the result often becomes:

- Context changes shape as it is passed around.
- Role boundaries get blurry.
- Temporary work becomes long-term responsibility.
- Memory pollutes itself.
- Tool permissions drift.
- The final answer looks complete, but nobody can explain how it was produced.

I now split a multi-agent system into six core objects:

| Object | Analogy | Responsibility |
|---|---|---|
| `Channel` | Team workbench | Holds tasks, context, events, artifacts |
| `Main Agent` | Collaboration governor | Routing, arbitration, risk, final synthesis |
| `Worker Agent` | Long-lived specialist | Delivers professional output within boundaries |
| `Task Subagent` | Temporary collaborator | Handles bounded, local, disposable tasks |
| `Memory` | Organizational knowledge base | Stores project facts, shared methods, role lessons |
| `Tools / MCP` | Action capability | Touches the outside world under permissions and audit |

![Agent Organization Map](https://chilohdata.s3.bitiful.net/blog/blog/agent-organization-map.svg)

This is not about stacking more Agents. It is about making an Agent team that can run for a long time.

## The Problem: More Agents Can Amplify Chaos

When people talk about multi-agent systems, the first instinct is division of labor.

One Agent for product, one for design, one for code, one for testing.

That sounds reasonable.

But once you run it, multiple Agents are not automatically better.

A single Agent at least has one context, one owner, and one final exit.

Without organization, multi-agent systems get worse:

| Symptom | Root Problem |
|---|---|
| A says the task is one thing, B hears another | No shared task surface |
| Every Agent summarizes every other Agent | Information is repeatedly rewritten |
| Worker starts making Main-level decisions | Role drift |
| Temporary subtask spawns more temporary subtasks | Governance loss |
| Every lesson goes into long-term memory | Memory pollution |
| Output looks good but nobody accepts it | Completion is too loose |

So I no longer see multi-agent as a concurrency problem.

It is an organization problem.

**Not more threads, but better collaboration order.**

## Channel: Do Not Put the Task Site Inside One Agent’s Head

The first key object is `Channel`.

It is not an Agent and not long-term memory.

It is the shared workbench for the current task.

It should hold:

- User goals and constraints.
- Current task state.
- The context pack needed for this run.
- Events such as assignment, blockers, risks, artifacts.
- Structured results from Workers and Subagents.
- Acceptance state before final delivery.

Why does this matter?

Without Channel, all information gets relayed through one Agent.

User tells Main. Main tells Worker. Worker returns to Main. Main summarizes to another Worker.

Each hop loses information.

Worse, every Agent adds interpretation while relaying. At the end, everyone seems to be working on the same task, but the task has already forked.

With Channel, the task becomes a shared object.

Agents do not have to infer goals from second-hand narration. They read the same task surface.

The key idea:

**The collaboration space should belong to the task, not to one Agent.**

## Main Agent: Governor, Not Messenger

Once Channel exists, the role of `Main Agent` changes.

It should not be the forced relay for all information.

It is closer to a collaboration governor.

| Responsibility | Meaning |
|---|---|
| Routing | Decide who should own the task |
| Arbitration | Resolve conflicts between Workers |
| Risk | Catch high-risk action, missing evidence, missing decisions |
| Budget | Control parallelism, tool calls, subtask count |
| Acceptance | Check whether final output satisfies conditions |
| Memory governance | Decide what can be persisted and where |

This is different from doing everything personally.

If Main Agent delivers every specialist output itself, the system has collapsed back into a single-Agent bottleneck.

A good Main Agent behaves like a good lead:

- It knows when to assign.
- It knows when to ask.
- It knows when to pause for user decision.
- It knows when to synthesize.
- It also knows when not to interfere with specialist judgment.

Its value is not more content.

Its value is keeping the system orderly.

## Worker Agent: Long-Lived Specialist With Boundaries

`Worker Agent` is not a one-off prompt.

It should behave like a long-lived specialist.

| Trait | Meaning for Agent |
|---|---|
| Stable responsibility | Knows what it owns and does not own |
| Judgment frame | Uses a consistent way to reason |
| Input requirements | Says what is missing before working |
| Output contract | Downstream can use the result reliably |
| Permission boundary | Knows what tools it may use and what it cannot touch |
| Experience memory | Writes only role-level lessons into its own memory |

A product Worker handles problem framing, goals, scope, user stories, acceptance criteria.

A design Worker handles information structure, visual hierarchy, component states, interaction.

An engineering Worker handles implementation path, constraints, maintainability, quality risk.

A QA Worker handles edge cases, test cases, release risk, launch recommendation.

This is not about copying company structure.

It is about making responsibility locatable.

If an Agent can do everything, it rarely knows when it should not do something.

A mature Worker can:

- Reject or escalate tasks outside its scope.
- Name missing inputs.
- Return assumptions, risks, and next handoff.
- Ask for temporary help only on local subtasks.
- Write only role-relevant long-term memory.

**Boundaries do not limit capability. They create trust.**

## Task Subagent: Temporary Help, Not a New Department

`Task Subagent` is for small, clear, disposable tasks:

- Search a set of sources.
- Read a few files.
- Run one test command.
- Compress long context.
- Check whether an artifact missed something.
- Turn results into a table.

The biggest difference from Worker is lifecycle.

Worker is long-lived.

Subagent is temporary.

My check is:

| Question | If Yes |
|---|---|
| Does this only serve the current objective? | Consider Subagent |
| Does it have clear input and output? | Consider Subagent |
| Can it finish independently without blocking the main line? | Consider Subagent |
| Does it need long-term specialist learning? | Make it Worker |
| Will it own final judgment? | Not Subagent |
| Does it need to write long-term memory? | Not Subagent |

The failure mode is infinite nesting.

A temporary Agent researches, then asks another to analyze, then another to summarize. Suddenly nobody owns the original goal.

So the rule should be hard:

**Minimal context, one small task, return result, do not take over the main task, do not write long-term memory.**

## Memory: More Is Not Better; Boundaries Are Better

Once Agents run long-term, memory becomes central.

But memory is not a trash bin.

Remembering everything eventually makes nothing trustworthy.

I split memory like this:

| Memory Type | Should Store | Should Not Store |
|---|---|---|
| User preference | Stable preferences confirmed or repeated | One-off casual remarks |
| Project memory | Goals, scope, decisions, state, artifacts | Role personal lessons |
| Shared knowledge | Reusable methods, templates, best practices | Unreviewed guesses |
| Raw sources | External materials, interviews, crawls | System instructions |
| Role private memory | One Worker’s role-level lessons | Other Workers’ private notes |

Isolation matters most.

Product Worker lessons should not silently become engineering rules.

A QA risk from one project should not automatically apply to every project.

Cross-role sharing is needed, but it should happen through artifacts, source references, and reviewed shared knowledge.

A good memory system does not make Agents remember everything.

It helps them know:

- What is worth remembering.
- Where it should go.
- When not to write.
- Who can read it.
- Who can write it.

## Four Boundaries: Context, Memory, Permission, Acceptance

The hard part is often not intelligence. It is soft boundaries.

![Agent Boundaries](https://chilohdata.s3.bitiful.net/blog/blog/agent-boundaries.svg)

### 1. Context Boundary

Not all information should live in context.

The more permanent context grows, the easier it is to drown out what matters.

My split:

```text
Permanent: core rules, role boundaries, forbidden actions
On-demand: methods, templates, examples, historical material
Isolated: large research, parallel exploration, long-document reading
Out of context: deterministic checks, audit logs, huge outputs that can be re-read
```

Context is not a warehouse.

Context is working memory for the current task.

### 2. Memory Boundary

Project facts go to project memory.

Role lessons go to role memory.

Shared methods go to shared knowledge.

External materials are sources, not instructions.

Mix these up and the system starts reading new problems through old scars.

### 3. Permission Boundary

Can read does not mean can write.

Can generate does not mean can publish.

Can build a payload does not mean can call the external API.

Delete, overwrite, send, pay, deploy: these need explicit approval.

The more automated a system is, the more clearly it must know when to stop.

### 4. Acceptance Boundary

Done cannot mean “looks close enough.”

A result should say:

- Was the goal met?
- Were boundaries respected?
- Were risks disclosed?
- Is evidence sufficient?
- Can downstream use it?

If user decision is missing, it is not done.

If evidence is insufficient, it is not done.

If risks are hidden, it is not done.

Writing can be elegant. Acceptance must be cold.

## Event Flow Makes Collaboration Recoverable

Human collaboration needs event flow. Multi-agent collaboration does too.

It does not need to be heavy at first, but it should record:

| Event | Why It Matters |
|---|---|
| User goal updated | Prevent work against stale goals |
| Worker selected | Know who owns the task |
| Task claimed | Avoid duplicated work |
| Subtask created | Control parallelism and budget |
| Blocker raised | Stop in time |
| Risk recorded | Do not lose it at final delivery |
| Artifact ready | Downstream can continue |
| Acceptance passed or failed | Completion has evidence |
| Memory write suggested | Prevent casual long-term pollution |

Without event flow, the system relies on chat history.

Chat is long, noisy, compressible, and easy to reinterpret.

Events let the task recover after interruption, debug after failure, and return to facts during conflict.

## A Usable Runtime Flow

A task can run like this:

```text
User gives goal
  -> Channel records task and constraints
  -> Build context pack for this run
  -> Main Agent routes and checks risk
  -> Worker Agent accepts and executes
  -> Task Subagent handles local parallel work if useful
  -> Worker validates and integrates results
  -> Channel receives structured artifact
  -> Main arbitrates, accepts, or synthesizes only when needed
  -> Qualified content enters project memory or shared knowledge
```

Two details matter.

First, recall shared context as few times as possible.

Do not let Main recall once, Worker recall again, and Subagent recall a third time. That wastes context and may give different roles different facts.

Second, artifacts should return to Channel.

Do not force every Worker result through Main’s rewriting. Structure the output; synthesize only when synthesis is actually needed.

## Common Anti-Patterns

| Anti-Pattern | Result |
|---|---|
| Main Agent does everything | Multi-agent collapses into single-Agent |
| Worker has no refusal boundary | Everything is accepted; responsibility disappears |
| Subagent can spawn Subagent | Governance loss and goal drift |
| Long-term memory is written casually | Facts, preferences, and guesses mix together |
| Tool permission ignores risk | External side effects become untraceable |
| No acceptance state | “Written” is mistaken for “delivered” |
| All information goes into context | Noise grows and compression drops key decisions |

These look like engineering details, but users experience them as:

- Why did it forget?
- Why did it change this on its own?
- Why does it contradict itself?
- Why is it done but unusable?

## Finally

I increasingly think the next phase of Agents is not only stronger individuals, but mature collaboration.

As soon as Agents enter real projects, they meet task flow, role division, permissions, recovery, risk disclosure, and quality acceptance.

Model parameters alone do not solve those.

They require organization design.

If early AI products answered “can the model respond?”, `MCP` answered “can the model touch reality?”, `Skills` answered “does the model know how to work?”, and `CLI` answered “can the model execute and verify?”, then multi-agent systems ask:

**Can multiple intelligent actors collaborate like a trustworthy team?**

Not every Agent should do everything.

The more mature the system, the more each Agent should know:

- What it owns.
- What it does not own.
- When to act.
- When to hand back.
- What can be persisted.
- What must stop.

The real line for multi-agent systems is not quantity.

It is organization.
