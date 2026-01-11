---
type: slash-command
command: /kernel-boot
aliases: ["/startup", "./kernel-boot", "./startup", "/claude-boot", "./claude-boot"]
purpose: Load kernel context with tiered loading - mandatory files by default, full context with --full
description: Session initialization command with tiered loading to minimize boot context while preserving full capability. Model-agnostic - works with any LLM runtime.
scope: Session initialization, context loading
version: 3.0.0
last_updated: 2026-01-11

contract:
  mode: factual
  precision_scale: strict
  escalation_triggers: []  # Read-only context loading
  resource_expectations:
    token_usage: low
---

# Kernel Boot Command

Initialize Capturebox Natural Language Operating System with tiered kernel loading. This command is model-agnostic and works with any LLM runtime (Claude Code, Cursor, Ollama, llama.cpp, LM Studio, etc.).

## Design Rationale

Every token at boot costs context for actual work. The tiered design loads only essential files by default (~10.6K tokens, 5.3% of context), deferring capabilities until needed.

| Tier | Files | Tokens | Loaded |
|------|-------|--------|--------|
| Mandatory | memory.md, AGENTS.md, axioms.yaml | ~10,600 | Always |
| Lazy | personalities.md | ~3,600 | On `/assume` |
| Lazy | COMMAND-MAP.md | ~1,350 | On `/sys-ref` or command lookup |

## Behavior

### Default: `./kernel-boot`

Load mandatory tier only:

1. **Read Mandatory Kernel Files** (in priority order):
   - Read `memory.md` (behavioral directives)
   - Read `AGENTS.md` (agent kernel, hard invariants)
   - Read `axioms.yaml` (canonical definitions)

2. **Generate Boot Summary**:
   - Confirm mandatory files loaded
   - Show lazy tier as available but not loaded
   - Display active constraints
   - Report token usage

### Full: `./kernel-boot --full`

Load all tiers:

1. **Read All Kernel Files**:
   - Read `memory.md` (behavioral directives)
   - Read `AGENTS.md` (agent kernel, hard invariants)
   - Read `axioms.yaml` (canonical definitions)
   - Read `personalities.md` (voice presets)
   - Read `.cursor/commands/COMMAND-MAP.md` (command registry)

2. **Generate Full Boot Summary**

### Output Format (Default)

```
NL-OS KERNEL BOOT SEQUENCE

Kernel Status (Mandatory):
  [x] memory.md - behavioral directives loaded
  [x] AGENTS.md - hard invariants loaded
  [x] axioms.yaml - canonical definitions loaded

Lazy-Load Available:
  [ ] personalities.md - load via /assume
  [ ] COMMAND-MAP.md - load via /sys-ref

Active Constraints:
  - No emojis in output
  - Preserve frontmatter and metadata
  - Append-only logs (hype.log)
  - Prefer patch edits over rewrites

Boot: ~10,600 tokens | Context remaining: ~189K

KERNEL BOOT COMPLETE
```

### Output Format (--full)

```
NL-OS KERNEL BOOT SEQUENCE (FULL)

Kernel Status:
  [x] memory.md - behavioral directives loaded
  [x] AGENTS.md - hard invariants loaded
  [x] axioms.yaml - canonical definitions loaded
  [x] personalities.md - voice presets loaded
  [x] COMMAND-MAP.md - command registry loaded

Active Constraints:
  - No emojis in output
  - Preserve frontmatter and metadata
  - Append-only logs (hype.log)
  - Prefer patch edits over rewrites

Systems: 17 | Commands: 58 | Skills: 5

Boot: ~15,500 tokens | Context remaining: ~184K

KERNEL BOOT COMPLETE (FULL)
```

### Variants

- `./kernel-boot` - Default: load mandatory tier only (~10.6K tokens)
- `./kernel-boot --full` - Load all tiers including lazy files (~15.5K tokens)
- `./kernel-boot --quiet` - Load mandatory tier silently, brief acknowledgment only
- `./kernel-boot --verify` - Load and validate all referenced paths exist
- `./kernel-boot --status` - Show boot status without reloading

### Error Handling

If any mandatory file is missing, report and handle appropriately:

| File | Tier | If Missing |
|------|------|------------|
| `memory.md` | Mandatory | CRITICAL - refuse to proceed |
| `AGENTS.md` | Mandatory | WARNING - proceed with caution |
| `axioms.yaml` | Mandatory | WARNING - proceed but note definitions unavailable |
| `personalities.md` | Lazy | N/A - not loaded by default |
| `COMMAND-MAP.md` | Lazy | N/A - not loaded by default |

## Contract

**Requires:**
- Input: None (or optional flags: --full, --quiet, --verify, --status)
- Context: Must be in capturebox repository (or have kernel files available)
- Files: Mandatory tier files should exist (memory.md is required)

**Guarantees:**
- Output: Boot status summary in chat (unless --quiet)
- Side effects: No file writes, context loading only
- Default behavior: Reads ~10.6K tokens (mandatory tier)
- Full behavior: Reads ~15.5K tokens (all tiers)

**Refuses:**
- Running without kernel files available
- Writing to any files
- Proceeding without memory.md (mandatory file)

## Examples

### Example 1: Default Boot (Mandatory Only)

**User:** `./kernel-boot`

**Assistant:**
```
NL-OS KERNEL BOOT SEQUENCE

Kernel Status (Mandatory):
  [x] memory.md - behavioral directives loaded
  [x] AGENTS.md - hard invariants loaded
  [x] axioms.yaml - canonical definitions loaded

Lazy-Load Available:
  [ ] personalities.md - load via /assume
  [ ] COMMAND-MAP.md - load via /sys-ref

Active Constraints:
  - No emojis in output
  - Preserve frontmatter and metadata
  - Append-only logs (hype.log)
  - Prefer patch edits over rewrites

Boot: ~10,600 tokens | Context remaining: ~189K

KERNEL BOOT COMPLETE
```

### Example 2: Full Boot

**User:** `./kernel-boot --full`

**Assistant:**
```
NL-OS KERNEL BOOT SEQUENCE (FULL)

Kernel Status:
  [x] memory.md - behavioral directives loaded
  [x] AGENTS.md - hard invariants loaded
  [x] axioms.yaml - canonical definitions loaded
  [x] personalities.md - voice presets loaded
  [x] COMMAND-MAP.md - command registry loaded

Active Constraints:
  - No emojis in output
  - Preserve frontmatter and metadata
  - Append-only logs (hype.log)
  - Prefer patch edits over rewrites

Systems: 17 | Commands: 58 | Skills: 5

Boot: ~15,500 tokens | Context remaining: ~184K

KERNEL BOOT COMPLETE (FULL)
```

### Example 3: Quiet Boot

**User:** `./kernel-boot --quiet`

**Assistant:**
> Kernel loaded (mandatory tier). Ready for capturebox operations.

### Example 4: Status Check

**User:** `./kernel-boot --status`

**Assistant:**
> Boot status: Mandatory tier loaded. Lazy tier available on demand. Run `./kernel-boot --full` for complete context.

## Implementation Notes

- **Tiered loading**: Default loads only mandatory files to preserve context
- **Lazy triggers**: personalities.md loads when `/assume` is called; COMMAND-MAP.md loads on `/sys-ref` or command lookup
- **Idempotent**: Safe to run multiple times (reloads fresh context)
- **Token efficiency**: Default saves ~4,900 tokens vs full boot
- **Model-agnostic**: Works with any LLM that can read files and follow instructions

## Backwards Compatibility

- `/claude-boot` and `./claude-boot` remain as aliases
- All existing workflows continue to work unchanged

## Portability Notes

This command is workspace-specific. To port to another NL-OS workspace:

1. Copy this file to `[workspace]/.cursor/commands/kernel-boot.md`
2. Update kernel file paths to match target workspace structure
3. Define which files are mandatory vs lazy for that workspace
4. Update token estimates based on actual file sizes
5. Ensure mandatory files exist at referenced paths

For local LLM runtimes, use the boot scripts in `scripts/`:
- `scripts/kernel-boot-ollama.sh`
- `scripts/kernel-boot-llama-cpp.sh`
- `scripts/kernel-boot-lm-studio.sh`

Or use the portable payload: `portable/kernel-payload.md`

Dependencies (Mandatory): memory.md, AGENTS.md, axioms.yaml
Dependencies (Lazy): personalities.md, COMMAND-MAP.md
