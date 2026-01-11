---
type: document
last_updated: 2025-12-03
description: |
  Directory overview and organization guide for all project folders in the Capturebox workspace. Summarizes folder structure, system definitions, archival process, natural language navigation patterns, and current status of principal active project systems.
---

# Projects Directory

## Structure

### active/

Work in progress — artifacts being actively developed.

- **active/cisco/** — Cisco work projects, drafts, analyses, decks
- **active/personal/** — Personal tasks, side projects, experiments

### systems/

Reusable systems and their operating files. These are frameworks/tools that generate artifacts.

| System                     | Purpose                                                              | Command(s)                          |
|----------------------------|----------------------------------------------------------------------|-------------------------------------|
| **design-pipeline**        | Tracker for UX design work — gates, artifacts, reminders, progress   | `/dp`, `/dp-status`, `/dp-gate`     |
| **design-thinking-system** | Constraint-based design analysis, XDR principles evaluation          | `/evaluate-design`, `/design-spec`  |
| **feature-forge**          | Orchestrator experiment for full automation (laboratory status)      | `/feature-forge`                    |
| **hype-system**            | Context-aware creative momentum and forward-looking observations     | `/hype`                             |
| **journalpad-system**      | Interactive journaling tool with adaptive Q/A and explore flavors    | `/journalpad`                       |
| **lateral-os**             | LSP Operating System — intelligence layer for ideation               | `/lsp-*` commands                   |
| **natural-language-os**    | Book project: "LLMs as substrate for domain-specific operating systems" | — book                           |
| **persona-as-agent**       | Security persona agents (SAM, REMI, ALEX, KIT, NIK) for HCD process  | `/persona-system`, `/persona-adapt` |
| **problem-solver-system**  | Lightweight connector aggregating problem-solving techniques from lateral-os, design-thinking-system, and signal-to-action | `/problem-solver` |
| **skills-engine-system**   | Define, store, and route reusable skills as low-flavor background capabilities | `/skills` |
| **self-writer-system**     | Performance reviews, personal reflection, growth journaling          | `/perf-writer`, `/self-reflect`     |
| **signal-to-action**       | Transform unstructured input into structured artifacts via recipes   | `/run-recipe`                       |
| **ux-blog-system**         | 6-phase systematic blog post creation                                | `/ux-blog`                          |
| **ux-writer-system**       | Context-aware UI copy generation (tooltips, microcopy, voice)        | `/ux-writer`, `/ux-voice-check`     |
| **visual-design-system**   | Gestalt-based perceptual design principles, constraints, and framework evaluation | —                    |

### tools/

Standalone utilities and helpers.

- **prompt-maker-for-ai-assistant/** — Example build prompt for UI components (see `/prompt-maker-ui` command)

---

## Natural Language Guidance

| Query                          | Path                                    |
|--------------------------------|-----------------------------------------|
| "Show me active work"          | `active/`                               |
| "Show me Cisco projects"       | `active/cisco/`                         |
| "Show me personal projects"    | `active/personal/`                      |
| "What systems are available?"  | `systems/`                              |
| "System outputs go where?"     | `active/` (drafts) or `docs/` (final)   |

---

## Archive Pattern

When a project is complete:

- Move from `active/cisco/` → `archive/projects/cisco/`
- Move from `active/personal/` → `archive/projects/personal/`

---

## Current Active Projects
---

## System Status

| System                 | Status                    | Last Updated |
|------------------------|---------------------------|--------------|
| design-pipeline        | Experimental/Pursuing     | 2025-12-20   |
| design-thinking-system | Active                    | 2025-11-29   |
| feature-forge          | Experimental/Laboratory   | 2025-12-20   |
| hype-system            | Active                    | 2025-11-30   |
| journalpad-system      | Active                    | 2025-12-19   |
| lateral-os             | Operational               | 2025-11-28   |
| natural-language-os    | First Draft               | 2025-12-01   |
| persona-as-agent       | Production                | 2025-11-29   |
| self-writer-system     | Active                    | 2025-11-27   |
| signal-to-action       | Active (v2 testing)       | 2025-11-30   |
| ux-blog-system         | Active                    | 2025-11-25   |
| ux-writer-system       | Active                    | 2025-11-24   |
| visual-design-system   | Active                    | 2025-12-09   |

---

## Philosophy

The systems in this directory share a common architecture: **human-in-the-loop epistemic control**.

These are not automation engines. They are cognitive accelerators.

### The Inversion

The system doesn't produce answers for the human. The human works to produce their own understanding *through* using the system.

This inverts the typical AI framing where the model is the intelligent agent and the human is the beneficiary. Here, the human is the intelligent agent. The model runs the operating system.

### How It Works

Each system follows a recursive pattern:

1. **Take input** — unstructured material, constraints, context
2. **Transform it** — into structured scaffolds, interpretable artifacts
3. **Hand it back** — for interrogation, reshaping, redirection
4. **Use human shaping** — as the next instruction

The system is not "working for" the operator. The operator is working *through* the system.

### Why This Matters

Understanding emerges through recursive interaction. Each pass through the system is a learning cycle:

| Interaction | What the Human Gains |
|-------------|----------------------|
| Reading outputs | Seeing material reflected in new structure |
| Interpreting meaning | Connecting system transforms to real intent |
| Refining direction | Clarifying and focusing what actually needs to be known |
| Reshaping artifacts | Discovering gaps in topic understanding |
| Adjusting protocols | Encoding insight into future iterations |

The system doesn't need to be "right" — it needs to be *useful for thinking*. Every interaction surfaces something: a connection you missed, a framing you hadn't considered, a question you didn't know to ask.

The human learns. The system accelerates the learning.

What emerges is a hybrid computational model:

> The machine transforms information.
> The human transforms the system.
> And the system transforms the human.

### The Doctrine

A Natural Language Operating System is a structured expert companion, but not the final authority; it is a structured way of thinking interactively with the machine. The model transforms your inputs, and you use those transforms to see more clearly, decide more deliberately, and learn faster.

> **Definition**: A Natural Language Operating System is a human-directed cognitive instrument that enables learning, reasoning, and decision-making through structured machine-mediated iteration.

---

*Last updated: 2025-12-20*
