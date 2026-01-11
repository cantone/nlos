---
type: slash-command
command: /sys-ref
purpose: Display quick-scan reference for all commands and systems
description: Quick reference guide showing commands and systems with descriptions and use-case triggers
scope: Navigation and discovery
version: 1.0.0
last_updated: 2025-01-08

contract:
  mode: factual
  precision_scale: strict
  escalation_triggers: []  # Read-only
  resource_expectations:
    token_usage: low
---

# System Reference (sys-ref)

Quick-scan reference for all slash commands and systems in Capturebox.

---

## Behavior

Display the contents of `.cursor/SYS-REF.md` in the chat.

**Usage:**
- `/sys-ref` — Show complete reference (no arguments)

**Purpose:**
- Solve the "forgetting" problem: remind you what commands and systems exist
- Quick scanning without opening multiple files
- Use-case triggers to help identify the right tool for your current task

**Output:**
- Display `.cursor/SYS-REF.md` contents in chat (read-only)
- User can then invoke any command or system they rediscover

---

## Implementation

```
1. Read `.cursor/SYS-REF.md`
2. Display contents in chat
3. Done
```

No arguments. No file creation. Pure reference display.

---

## Maintenance

The reference doc (`.cursor/SYS-REF.md`) is manually maintained. When commands or systems change:

1. Update command/system documentation first (as usual)
2. Update `.cursor/SYS-REF.md` to reflect changes
3. Optional: Run `/command-update-list sys-ref` + `/command-update-files` workflow if automation is desired

---

## Related Commands

- `/systems` — Detailed system summaries via Python CLI
- `/architecture` — Query architecture map for integration guidance
- `/skills` — List and route skills from `.cursor/skills/`
- `/whats-next` — Surface 3 interesting next actions

---

## Portability Notes

This command is self-contained and portable to any workspace:

1. Copy this file to `[workspace]/.cursor/commands/sys-ref.md`
2. Create `[workspace]/.cursor/SYS-REF.md` with your command/system listing
3. Run with `/sys-ref`

**Dependencies:** None (pure file read and display)
