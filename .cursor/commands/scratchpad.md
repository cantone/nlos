---
type: slash-command
command: /scratchpad
purpose: Capture full conversation threads (user + assistant) for session archival
version: 3.0.0
last_updated: 2025-12-16

contract:
  mode: factual
  precision_scale: strict
  escalation_triggers:
    - destructive_write
  resource_expectations:
    token_usage: low
---

# Scratchpad

Capture full conversation threads from this chat session. Unlike `/note` (quick thoughts), scratchpad logs entire exchanges with both user and assistant messages.

## Usage

```
/scratchpad [name] [--summary] [--daily]
```

**Parameters:**
- `[name]` — Optional name for the scratchpad (defaults to `scratchpad_YYYY-MM-DD.md`)
- `--summary` — Create condensed single-paragraph summary instead of full conversation
- `--daily` — Append to `docs/notes/dailies/YYYY-MM-DD.md` instead of scratchpads folder

**Examples:**
```
/scratchpad
# → Full conversation to scratchpads/scratchpad_2025-12-16.md

/scratchpad design-system-work
# → Full conversation to scratchpads/design-system-work.md

/scratchpad --summary --daily
# → Single-paragraph summary appended to dailies/2025-12-16.md
```

## Storage

- **Default**: `docs/notes/scratchpads/[filename].md`
- **With --daily**: `docs/notes/dailies/YYYY-MM-DD.md`
- Auto-create directories if missing

## File Format

**New file:**
```markdown
---
title: "Scratchpad: [name or date]"
date: YYYY-MM-DD
type: scratchpad
tags: [session, conversation]
---

# Scratchpad: [name or date]

## [HH:MM] - User
[User's message]

## [HH:MM] - Assistant
[Assistant's response]

---
```

**Existing file:** Append conversation with timestamps and separator.

## Protocol

Capture the substantive user/assistant exchanges from this chat session. Include discussions, decisions, work accomplished, and key insights. Format each message with timestamp and role.

On completion, append witness hit to `projects/systems/self-writer-system/data/witness_activity.jsonl`:
```json
{"v":1,"ts":"[ISO timestamp]","cmd":"scratchpad","area":"notes","out":"[target-file]"}
```
