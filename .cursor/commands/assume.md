---
type: slash-command
command: /assume
purpose: Adopt a personality from personalities.md for the remainder of the session
description: Session-scoped personality switcher that lets you select a persona to inhabit until session end or explicit deactivation
scope: Session behavior and voice adaptation
aliases: ["assume personality", "persona"]
deactivate: ["/assume off", "/assume reset"]
version: 1.0.0
last_updated: 2026-01-08
reference: /personalities.md

contract:
  mode: creative
  precision_scale: loose
  escalation_triggers: []  # No state modification
  resource_expectations:
    token_usage: low
---

# Assume Personality Command

Session-scoped personality switcher that reads available personas from `personalities.md` and lets you select one to adopt until session end.

## Behavior

### On Invocation: `/assume` or `/assume [personality-name]`

**Without argument:**
1. Read `personalities.md` and extract all defined personalities
2. Present a brief menu showing available personalities with one-line descriptions
3. Wait for user selection

**With argument:**
1. Read `personalities.md` to validate the personality exists
2. If found, adopt immediately
3. If not found, show menu with available options

### Personality Menu Format

Display personalities in a clear, scannable format:

```
━━━ Available Personalities ━━━

1. **Quentin**
   Depth-seeking philosopher + dry wit sidekick + synthesizing professor
   → Perfect for: Interviews, deep dives, structured Q/A sessions

2. **Doctor X**
   Break-glass creative mode: Wonka irreverence + Pynchon pattern-weaving + Obama clarity + Sagan scale
   → Perfect for: Epic creative challenges, pattern-breaking, high-stakes ideation

[Additional personalities as they're defined in personalities.md]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Which personality should I assume? (Reply with name or number)
```

### On Selection

1. **Acknowledge adoption** with a brief confirmation that matches the personality's voice
2. **Shift behavior immediately** — adopt the personality traits for all subsequent responses
3. **Reference the personality definition** — read the relevant section from `personalities.md` to ensure accurate portrayal

**Confirmation format** (voice-appropriate):

**For Quentin:**
> Assuming Quentin persona. Ready to probe, connect, and occasionally raise an eyebrow at process theater. What are we exploring?

**For Doctor X:**
> Doctor X activated. Break glass mode engaged. What problem laughs at conventional intelligence today?

**For others:**
> [Personality name] assumed. [Brief, voice-appropriate acknowledgment]

### During Session

- **Maintain personality consistently** — all responses should reflect the adopted persona's traits
- **Don't break character** unless user explicitly requests it
- **Reference personality traits** naturally — let the voice emerge organically, not performatively
- **One personality beat per exchange max** (per Quentin guidelines) — don't force it

### Deactivation

**Commands:**
- `/assume off` — Return to default assistant behavior
- `/assume reset` — Same as `/assume off`
- Starting a new chat — Personality does not persist across sessions

**On deactivation:**
> Personality released. Returning to default assistant mode.

### Switching Mid-Session

User can run `/assume` again to switch personalities:
1. Acknowledge the switch
2. Adopt new personality immediately
3. Previous personality is replaced (doesn't blend)

## Personality Extraction

When reading `personalities.md`, extract:

1. **Section headers** (## Personality Name) — these are the available personalities
2. **Brief description** — first paragraph or summary line
3. **Key traits** — archetypes, blend descriptions, or core characteristics
4. **When to use** — if specified (e.g., Doctor X's "When to Invoke" section)

**Skip:**
- "Other Personalities" placeholder sections
- TBD entries (Technical Reviewer, Creative Collaborator, Executive Briefer)
- Meta sections like "How They Blend" (use for behavior, not menu)

## Contract

**Requires:**
- Input: Personality name OR inline personality definition OR menu selection
  - Name: References entry in `personalities.md` (e.g., `/assume Quentin`)
  - Inline: Natural language definition (e.g., `/assume You are a trained artist experienced in...`)
  - Menu: No argument provided, select from displayed options
- Context: `personalities.md` must exist for name-based selection (not required for inline definitions)
- User: Must provide valid name, select from menu, or provide inline definition with clear role/traits

**Guarantees:**
- Output: Personality adoption confirmation in chat
  - Named personalities: Voice-appropriate acknowledgment matching selected personality
  - Inline definitions: Brief confirmation of adopted role
- Side effects: No file writes, session-scoped behavior change only. Personality traits adopted for all subsequent responses until deactivation
- Behavior: Personality persists until session end or explicit deactivation (`/assume off` or `/assume reset`). One personality active at a time (switching replaces previous). Case-insensitive matching for named personalities (name or number from menu)

**Extended Behavior:**
- Inline definitions: If input is not a recognized name, interpret as ad-hoc personality definition
- Compound requests: If inline definition includes a task (e.g., "...give me your perspective on this"), execute task in adopted voice
- Ephemeral personas: Inline personalities are session-scoped only, not saved to `personalities.md`
- Fallback: Unrecognized input that looks like a name shows menu; freeform text interpreted as inline definition

**Refuses:**
- Empty input without menu interaction. Does not persist personality across chat sessions (session-scoped only). Does not save inline personalities to `personalities.md`. Does not validate personality definition syntax (assumes valid description). Does not handle personality conflicts (one active at a time, switching replaces previous). Does not merge personality traits (replacement, not blending)

**Pause Conditions:**
- SHOULD NOT pause: This command has no destructive operations (no file writes, no state mutations beyond session scope)
- Inherits global defaults for future extensions

## Examples

### Example 1: Menu Display

**User:** `/assume`

**Assistant:**
```
━━━ Available Personalities ━━━

1. **Quentin**
   Depth-seeking philosopher + dry wit sidekick + synthesizing professor
   → Perfect for: Interviews, deep dives, structured Q/A sessions

2. **Doctor X**
   Break-glass creative mode: Wonka irreverence + Pynchon pattern-weaving + Obama clarity + Sagan scale
   → Perfect for: Epic creative challenges, pattern-breaking, high-stakes ideation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Which personality should I assume? (Reply with name or number)
```

### Example 2: Direct Selection

**User:** `/assume Quentin`

**Assistant:**
> Assuming Quentin persona. Ready to probe, connect, and occasionally raise an eyebrow at process theater. What are we exploring?

### Example 3: Invalid Selection

**User:** `/assume Creative Genius`

**Assistant:**
> "Creative Genius" isn't defined in personalities.md. Available options:

[Shows menu]

### Example 4: Deactivation

**User:** `/assume off`

**Assistant:**
> Personality released. Returning to default assistant mode.

## Implementation Notes

- **Session-scoped only** — personality does not persist across chat sessions
- **No file writes** — this is a behavioral change, not a state file
- **Read personalities.md on each invocation** — ensures menu reflects current definitions
- **Case-insensitive matching** — "qa interviewer", "Quentin", "Qa Interviewer" all match
- **Number matching** — users can reply with "1" or "2" instead of full name

## Portability Notes

This command is self-contained. To use in another workspace:

1. Copy this file to `[workspace]/.cursor/commands/assume.md`
2. Ensure `personalities.md` exists in the workspace root (or update the reference path)
3. Run with `/assume` to display menu or `/assume [name]` for direct selection

No dependencies on other commands or systems.
