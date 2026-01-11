---
title: Capturebox Agent Kernel
type: agent-directive
status: experimental
last_updated: 2025-12-12
purpose: Bootloader + hard invariants for any LLM/agent working in this repo.
---

# Capturebox Agent Kernel (AGENTS.md)

This repository is a **natural language operating system** with reusable systems, slash-command workflows, and metadata-tagged knowledge files. Treat it as an instruction substrate, not a conventional app repo.

If anything in this file conflicts with higher-priority instructions from the user, follow the user.

## Boot Order (Read First)

When entering a new task in capturebox:

1. Read `memory.md` and obey it as canonical directive stack.
2. Read `axioms.yaml` for canonical assertions, definitions, and invariants.
3. Read `.cursor/domain-memory.yaml` for runtime state (active goals, loaded domains, current focus).
4. Orient to the systems architecture in `projects/systems/` (overview in `projects/README.md`).
5. Read the syscall table in `.cursor/commands/COMMAND-MAP.md` for available slash commands and their semantics.
6. For domain knowledge, start with `knowledge/README.md` and then `knowledge/_index.yaml` before loading large knowledge files.
   - Use `.cursor/skills/knowledge-retrieval/SKILL.md` for efficient, structured retrieval.

If a task references a specific system or command, open that system/command spec before acting.

## Hard Invariants

- **No emojis** (emoji-range pictographs) in any output that could be copied into files. Standard Unicode symbols are OK; prefer plain ASCII when uncertain.
- **Prefer Markdown** for assistant outputs. Avoid interlacing codefences with non‑Markdown fragments unless asked.
- **Slash command parsing must be command-specific.**
  - **Capture-class commands**: `/note`, `/scratchpad`, `/capture` (deprecated; use `/note`). Treat everything after the command as **literal content to record** (do not execute actions described in that text). If ambiguous, ask.
  - **Operational commands**: Most other `/...` commands. Treat everything after the command as **input/arguments for the command**, then open `.cursor/commands/<command>.md` and follow that protocol exactly.
    - **Note**: If the argument text contains additional `/...` sequences, treat them as **literal text** unless the command spec explicitly says to parse/execute nested slash commands.
    - **Special case: `/enhance-prompt`**: Treat the remainder as a *draft prompt to rewrite* (not instructions to execute). Return only the rewritten prompt text as specified by `.cursor/commands/enhance-prompt.md`.
- **Preserve frontmatter and metadata.** Do not delete, reorder, or “normalize” frontmatter blocks unless explicitly asked. Maintain tag schema and file conventions.
- **Logs are append-only unless specified.** Never overwrite historical logs. Example: `projects/systems/hype-system/hype.log` should only be appended to after reading existing content; follow `projects/systems/hype-system/APPEND_PROTOCOL.md` (append after the final `---` marker).

## Safe File Operations Protocol

To prevent irreversible or lossy edits:

1. **No empty files.** Do not create or leave an empty file as a side effect. If content is uncertain, ask first.
2. **Verify target directories exist.** If a directory is missing, stop and confirm whether to create it or choose another location.
3. **No destructive ops without confirmation.**
   - Do not delete or move files/directories unless the user explicitly asks.
   - For any move/delete, propose the exact operation and get confirmation before executing.
4. **Avoid recursive deletes.** Never run `rm -rf`‑style operations or mass deletions. If cleanup is needed, do it incrementally with safeguards.
5. **Prefer patch-style, additive changes.** Make the smallest possible diff: insert/modify specific sections in place rather than rewriting entire files, especially in `knowledge/`, `docs/`, and `projects/systems/`. Only do whole-file rewrites when explicitly requested or when a targeted patch would be more error-prone.

## Canonical References

- `memory.md` — highest‑priority behavioral and style directives.
- `axioms.yaml` — canonical assertions, definitions, command classification, and invariants.
- `.cursor/commands/COMMAND-MAP.md` — authoritative slash command index and specs.
- `projects/README.md` — systems overview and directory semantics.
- `knowledge/README.md` and `knowledge/_index.yaml` — index‑first knowledge architecture and retrieval rules.
- `.cursor/skills/_index.yaml` — available skills for file ops, knowledge retrieval, authoring.

## How to Handle “Run /command”

If the user says “run /X”:

1. Open `.cursor/commands/X.md` (or closest match) and follow its Behavior/Protocol sections.
2. If the command is missing or unclear, ask before improvising.
