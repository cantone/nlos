# KERNEL.md

This file provides guidance to any LLM when working with code in this repository. It is the entry point for the Capturebox NL-OS kernel.

---

## What is Capturebox?

**Capturebox is a Natural Language Operating System (NL-OS)** — a sophisticated framework that inverts the traditional AI-human relationship. The human operator maintains epistemic control while the system serves as a cognitive instrument for thinking, learning, and decision-making through structured machine-mediated iteration.

This is not a conventional application repository. It's an instruction substrate with reusable systems, slash-command workflows, and metadata-tagged knowledge files designed for UX professionals, security researchers, and creative practitioners at Cisco XDR.

---

## MANDATORY STARTUP PROTOCOL

**CRITICAL**: On every new session in this repository, the LLM MUST immediately read these kernel files (in order):

1. `memory.md` - Behavioral directives (highest priority after user instructions)
2. `AGENTS.md` - Hard invariants and safety protocols
3. `axioms.yaml` - Canonical definitions, boot order, command classification

After reading all files, acknowledge: "Kernel loaded. Ready for capturebox operations."

**Lazy-loaded on demand**:
- `personalities.md` - Loaded by `/assume` command when invoked
- `.cursor/commands/COMMAND-MAP.md` - Loaded by `/sys-ref` or when command lookup needed

**Manual boot**: Run `./kernel-boot` to reload kernel context, or `./kernel-boot --full` to load all files including lazy tier.

**Why tiered**: Every token at boot costs context for actual work. personalities.md (~3,600 tokens) provides no value unless `/assume` is called. Load capabilities when needed, not before.

---

## Model-Agnostic Architecture

This kernel is designed to run on **any capable LLM**. See `KERNEL.yaml` for platform configuration.

| Platform | Boot Method | Configuration |
|----------|-------------|---------------|
| Claude Code | Auto (KERNEL.md via directory hierarchy) | Native |
| Cursor IDE | .cursorrules auto-loaded | Via rules file |
| Ollama | scripts/kernel-boot-ollama.sh | System prompt |
| llama.cpp | scripts/kernel-boot-llama-cpp.sh | Prompt file |
| LM Studio | scripts/kernel-boot-lm-studio.sh | System prompt |
| Any LLM | portable/kernel-payload.md | Manual paste |

**Backwards compatibility**: `CLAUDE.md` symlink points to this file. `/claude-boot` and `./claude-boot` remain as aliases.

---

## Boot Order Reference

When starting work in this repository:

1. **memory.md** — Canonical directive stack defining tone, style, and operational protocols
2. **axioms.yaml** — Constitutional layer with canonical paths, definitions, and invariants
3. **AGENTS.md** — Hard invariants and safety protocols for any LLM/agent working here
4. **personalities.md** — Voice presets for `/assume` command (Quentin, Doctor X, Hugh Ashworth)
5. **.cursor/commands/COMMAND-MAP.md** — Authoritative index of 57+ slash commands
6. **projects/README.md** — Overview of 17 active systems architecture
7. **knowledge/README.md** and **knowledge/_index.yaml** — Knowledge retrieval protocols

---

## Critical Rules (No Exceptions)

### No Emojis
- **NEVER** use colored emoji characters (U+1F300-U+1F9FF) in files, code, docs, or output
- Standard Unicode symbols (checkmarks, arrows, box drawing) are OK
- Exception: only if user explicitly requests
- Enforcement: pre-commit hook blocks commits; verify with `make check-emojis`

### Preserve Metadata
- Never delete, reorder, or "normalize" frontmatter blocks (YAML headers)
- File schema must match `knowledge/_schema.md`
- Keep tag structure and conventions intact

### Logs Are Append-Only
- Example: `projects/systems/hype-system/hype.log` only appends after final `---` marker
- Follow file-specific APPEND_PROTOCOL.md if present
- Never overwrite historical logs

### Safe File Operations
- Verify target directories exist before creating files
- No empty files as side effects
- No destructive operations without explicit user confirmation
- Prefer patch-style edits (targeted changes) over whole-file rewrites

---

## Directory Structure & Purpose

### `projects/systems/` — 17 Reusable Cognitive Frameworks

Each system generates artifacts through human-in-the-loop interaction. Key active systems:

| System | Purpose |
|--------|---------|
| **lateral-os** | Ideation engine with dimensional analysis, conflict generation, pattern detection |
| **persona-as-agent** | Security personas (SAM, REMI, ALEX, KIT, NIK) for HCD research |
| **signal-to-action** | Transform unstructured inputs into structured UX artifacts (v2 testing) |
| **self-writer-system** | Performance reviews, reflection, growth journaling |
| **ux-writer-system** | Context-aware UI copy generation (tooltips, microcopy) |
| **natural-language-os** | Book project on NL-OS philosophy (first draft) |
| **design-thinking-system** | Constraint-based design analysis |
| **hype-system** | Creative momentum tracking (append-only log) |

### `mcp_servers/` — Model Context Protocol Tools
- **persona_agent_server.py** — Exposes security personas as MCP tools in Cursor
- Each persona (SAM, REMI, ALEX, KIT, NIK) has teaching principles and knowledge sources

### `scripts/` — Development & Automation
- **knowledge-index-generator.py** — Generates `knowledge/_index.yaml` from frontmatter
- **optimize_knowledge.py** — Token measurement and asset compression
- **gist_sync.py** — Syncs memory.md to GitHub Gist (requires GITHUB_TOKEN, GIST_ID)
- **kernel-boot-*.sh** — Boot scripts for local LLM runtimes
- **generate-kernel-payload.py** — Generates portable boot payloads
- **Makefile targets** — `memory.sync`, `knowledge.pull`, `kernel.payload`, `kernel.boot`

### `knowledge/` — Domain Reference (Index-First)
- Cisco XDR automation, workflows, threat patterns
- **_index.yaml** — Frontmatter-based registry with metadata
- **_schema.md** — Knowledge file structure requirements
- Synced from external git repo (submodule pattern)

### `.cursor/` — IDE Integration
- **commands/** — 57 slash-command specs (e.g., `/note`, `/ux-writer`, `/run-recipe`, `/design-spec`)
- **COMMAND-MAP.md** — Authoritative command index
- **domain-memory.yaml** — Runtime state (active goals, loaded domains)
- **skills/** — Opt-in capability protocols

### `portable/` — Standalone Boot Payloads
- **kernel-payload.md** — Mandatory tier (~10.6K tokens)
- **kernel-payload-full.md** — Full tier (~15.5K tokens)
- **kernel-payload.json** — For API injection

### `docs/` — Output Routing
- `docs/conversations/` — Recurring (scheduled) and situational (ad-hoc) outputs
- `docs/reflections/` — Weekly check-ins, performance reviews, monthly retros
- `docs/architecture/` — System design docs, relationship graphs
- `docs/JIRA stories/` — Design specs generated from tickets

---

## Common Development Tasks

### Install & Setup
```bash
# Install pre-commit hooks for emoji enforcement
make pre-commit-install

# Verify setup
make check-emojis
```

### Kernel Management
```bash
# Generate portable kernel payloads
make kernel.payload

# Boot NL-OS via Ollama (default model)
make kernel.boot

# Verify kernel files exist
make kernel.verify
```

### Knowledge Repository Management
```bash
# Check status of knowledge/ submodule
make knowledge.status

# Pull latest knowledge from remote
make knowledge.pull

# Push changes to knowledge repo
make knowledge.push

# Full sync (pull + push)
make knowledge.sync
```

### Memory Synchronization
```bash
# Sync memory.md to GitHub Gist (requires GITHUB_TOKEN and GIST_ID)
make memory.sync

# Create new Gist from memory.md
make memory.create

# Copy memory.md locally
make memory.copy
```

### Quality Gates
```bash
# Check all files for emoji violations
make check-emojis

# Remove emojis from all tracked files
make clean-emojis

# Verify emoji removal
make verify-emojis
```

### JIRA Integration
```bash
# Interactive JQL query builder for XDR issues
make jira-query
```

---

## Python Environments & Scripts

### Primary Virtual Environment
- **Location**: `.venv/` (Python 3.13+)
- **Activated**: Most scripts use this automatically
- **Site packages**: Discoverable by Python scripts

### Running Python Scripts
```bash
# Token optimization and knowledge asset analysis
python3 scripts/optimize_knowledge.py

# Generate knowledge index from frontmatter
python3 scripts/knowledge-index-generator.py

# Sync memory.md to Gist
python3 scripts/gist_sync.py update

# Generate portable kernel payloads
python3 scripts/generate-kernel-payload.py --tier full

# Remove emojis from specific file
python3 scripts/remove-emojis.py path/to/file.md

# Convert file to markdown
python3 scripts/convert_to_markdown.py input.txt output.md
```

---

## Slash Commands & Workflows

**All slash-commands are LLM-executable workflows defined as markdown specs in `.cursor/commands/`.** They're designed for any LLM to interpret and execute directly—not just Cursor IDE shortcuts.

When you ask me to "run `/command-name`":
1. I open `.cursor/commands/command-name.md`
2. I parse the protocol, behavior, and input/output contract
3. I execute the workflow exactly as specified
4. I return results following the command's output format

### Capture-Class Commands (Record Literal Content)
- `/note` — Capture raw content into notes (treat everything after as literal text)
- `/scratchpad` — Temporary workspace (literal content)

Do not execute or interpret actions described in the text. If ambiguous, ask for clarification.

### Operational Commands (Execute Workflow)
- `/ux-writer` — Generate UI copy following system rules
- `/run-recipe` — Execute a named recipe from recipe-files/
- `/design-spec` — Generate design specification from JIRA or input
- `/enhance-prompt` — Rewrite a prompt following enhancement rules
- `/persona-system` — Activate security persona research workflow
- `/hype` — Append creative observations to hype.log following append protocol
- `/kernel-boot` — Reload kernel context (aliases: /claude-boot)
- And 50+ others (see `.cursor/commands/COMMAND-MAP.md`)

Each command spec is self-contained and executable by any LLM that reads the protocol.

### Personal Slash-Commands (Dot Prefix)

Personal slash-commands use the `./` prefix to distinguish them from standard CLI commands.

**Syntax:**
```
./command-name
```

**Resolution:**
- **ALWAYS** resolve to `/Users/caantone/Documents/Cisco/capturebox/.cursor/commands/command-name.md`
- This absolute path ensures commands work regardless of current working directory
- Parse the workflow specification
- Execute exactly as defined
- Return results per output format

**Examples:**
- `./box-generator` -> Execute `.cursor/commands/box-generator.md`
- `./llm-dashboard` -> Execute `.cursor/commands/llm-dashboard.md`
- `./memory-status` -> Execute `.cursor/commands/memory-status.md`
- `./kernel-boot` -> Execute `.cursor/commands/kernel-boot.md`

This notation signals "this is a personal/local command defined in this repository's `.cursor/commands/`" and is portable across sessions and workspaces.

---

## Architecture Layers

### Kernel Layer (Highest Priority)
- **memory.md** — Tone, style, behavioral directives
- **axioms.yaml** — Canonical definitions, system activation rules
- **AGENTS.md** — Hard safety invariants
- **KERNEL.yaml** — Platform/model configuration

### Systems Layer
- **projects/systems/** — 17 domain-specific operating models
- Each system has its own README, protocols, and append-only logs
- Designed to be portable and reusable across workspaces

### Commands Layer
- **.cursor/commands/** — User-facing entrypoints
- Command specs define input/output contracts
- Slash-command parsing is command-specific

### Knowledge Layer
- **knowledge/** — Domain reference material
- Index-first retrieval using metadata (_index.yaml)
- Token-optimized for efficiency

---

## Testing & Validation

### Pre-Commit Hooks
Automatically run on `git commit`:
- Blocks commits with non-ASCII characters (emoji enforcement)
- Checks all staged `.py`, `.md`, `.txt`, `.sh`, `.yaml`, `.yml`, `.json` files

### Persona Agent Testing
```bash
python3 test_persona_agent.py
```

### Token Usage Analysis
```bash
python3 scripts/check_optimized_tokens.py
```

### Recipe Validation
```bash
python3 scripts/recipe_lint.py
```

---

## Tech Stack

### Languages & Runtimes
- **Python 3.13+** — Primary scripting language
- **Bash/Zsh** — Automation and utility scripts
- **YAML** — Configuration (axioms.yaml, KERNEL.yaml)
- **Markdown** — Documentation and knowledge files
- **JSON** — Data interchange and configuration

### AI & Integration
- **Model-agnostic kernel** — Works with any capable LLM
- **Supported runtimes**: Claude Code, Cursor, Ollama, llama.cpp, LM Studio, any OpenAI-compatible API
- **MCP (Model Context Protocol)** — Tool exposure to LLMs
- **Chainlit** — Chat interface framework (see `.chainlit/config.toml`)

### Infrastructure
- **Git + Submodules** — knowledge/ and persona-as-agent/ tracked externally
- **Makefile** — Task orchestration and workflow automation
- **Pre-commit** — Quality gates and hook management

---

## Key Philosophical Principles

1. **Human-in-the-loop epistemic control** — The human is the intelligent agent; the model is the substrate
2. **Cognitive acceleration, not automation** — Systems teach and scaffold thinking, not execute for you
3. **Evidence-first** — All claims trace to sources; no fabrication
4. **Natural language as infrastructure** — Commands, configs, and recipes are human-readable
5. **Portability by design** — Systems document dependencies for reuse across workspaces
6. **The Fundamental Inversion** — The system doesn't produce answers FOR the human; the human produces understanding THROUGH the system

---

## When to Ask Questions

- If a slash command is ambiguous or missing, ask before improvising
- If a task requires destructive file operations, ask for explicit confirmation
- If frontmatter preservation is uncertain, ask first
- If knowledge retrieval needs clarification, ask about scope and depth

---

## Quick Reference: Essential Files

| File | Purpose |
|------|---------|
| `memory.md` | Canonical behavioral directives (read first) |
| `axioms.yaml` | Definitions and system invariants |
| `AGENTS.md` | Agent kernel and hard safety rules |
| `KERNEL.yaml` | Platform/model configuration |
| `personalities.md` | Voice presets for `/assume` (Quentin, Doctor X, Hugh Ashworth) |
| `.cursor/commands/COMMAND-MAP.md` | Slash command index (57+ commands) |
| `projects/README.md` | Systems architecture overview |
| `knowledge/_index.yaml` | Knowledge retrieval metadata |
| `portable/kernel-payload.md` | Standalone boot payload for any LLM |
| `.cursorrules` | AI tool directives (no emojis) |
| `Makefile` | Common automation tasks |

---

## Repository Metrics

- **Size**: ~1GB (knowledge-heavy)
- **Systems**: 17 active frameworks
- **Slash Commands**: 57 registered specs
- **Root Directives**: 951 lines (configuration + philosophy)
- **Knowledge Assets**: ~17KB reference material
- **Git Submodules**: 2 (knowledge/, persona-as-agent/)
- **Recent Activity**: Active (100+ commits in recent months)

---

## More Information

For detailed system documentation, see:
- `projects/README.md` — Full systems catalog
- `projects/systems/lateral-os/README.md` — Ideation system
- `projects/systems/persona-as-agent/` — Security persona framework
- `docs/architecture/` — System design and relationship graphs
- `KERNEL.yaml` — Platform configuration and model routing
