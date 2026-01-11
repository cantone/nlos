---
type: slash-command
command: /note
purpose: Ultra-fast note capture via shell script
version: 5.1.0

contract:
  mode: factual
  precision_scale: strict
  escalation_triggers:
    - destructive_write
  resource_expectations:
    token_usage: low
---

# /note

## Behavior

1. Run: `/Users/caantone/Documents/cisco/capturebox/scripts/note.sh`
   - **With content**: Append timestamped entry with content to today's daily note
   - **No content**: Append timestamp marker only (creates checkpoint)
   - Creates `docs/notes/dailies/YYYY-MM-DD.md` if it doesn't exist

2. **IMPORTANT**:  Open today's daily note in the editor: `docs/notes/dailies/YYYY-MM-DD.md`

No confirmation. No output.

