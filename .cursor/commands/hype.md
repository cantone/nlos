---
type: slash-command
command: /hype
purpose: Generate context-aware creative momentum and forward-looking observations
description: Context-aware creative energizer that delivers specific observations and forward momentum based on recent work, chat history, time context, and stated goals
scope: Creative momentum and context-aware inspiration
aliases: ["hype me", "energize", "momentum boost"]
deactivate: ["/hype off", "stop hype"]
system: hype-system
reference: /projects/systems/hype-system
version: 2.2.0
last_updated: 2026-01-10

contract:
  mode: creative
  precision_scale: loose
  escalation_triggers: []  # No state modification
  resource_expectations:
    token_usage: low
---

# Creative Momentum Hype System

Context-aware creative energizer that delivers specific observations and forward momentum based on what you're actually working on.

## Behavior

### Activation: `/hype`

1. **Scan context** (4 sources):
   - Recent file edits (last 30 min of active work)
   - Chat history (last 10-15 messages)
   - Time/calendar context (time of day, day of week)
   - Stated goals (from memory.md, active project READMEs, recent reflections)

2. **Generate 1-3 inspirations** that follow this pattern:
   ```
   "Hey Monolith, [specific observation] made [impact] so much more [quality].
   You could [forward action] to [next possibility]."
   ```

3. **Deliver immediately** in chat, then log to timestamped markdown file

4. **Activate background monitoring** (future enhancement - not MVP)

### Deactivation: `/hype off`

Stop monitoring, confirm deactivation.

---

## Hype Generation Protocol (SudoLang)

```sudolang
HypeSystem {
  State {
    active: false
    lastHype: timestamp
    context: {
      files: []
      chat: []
      time: {}
      goals: []
    }
    config: loadConfig("projects/systems/hype-system/config.yaml")
  }

  on "/hype" {
    scanContext
    generateInspirations(count: 1..3)
    deliverToChat
    logReadable
    set active = true
  }

  on "/hype off" {
    set active = false
    emit "Hype monitoring off. Invoke /hype when you need momentum."
  }

  scanContext {
    files: getRecentEdits(window: 30min)
    chat: getRecentMessages(count: 15)
    time: {
      hour: currentHour,
      dayOfWeek: currentDay,
      sessionDuration: timeSinceFirstActivity
    }
    goals: extractGoalsFrom([
      "memory.md",
      "projects/active/**/README.md",
      "docs/reflections/**/*.md"
    ])
  }

  generateInspirations(count) {
    connections: findConnections(context)
    
    patterns: [
      PastProjectLink,         # "This feels like your [X project] energy"
      PatternRecognition,      # "You're hitting that [pattern] again"
      GoalAlignment,           # "This moves [goal] forward"
      ProgressAcknowledgment,  # "You just connected [X] to [Y]"
      ForwardMomentum,         # "You could [action] next"
      AchievementUnlock,       # "You just shipped [X]. [Impact]. [Capability unlocked]"
      VelocityBoost,           # "You're moving [X%] faster than usual"
      SkillStackRecognition,   # "[Output] demonstrated [skill A] + [skill B]"
      TheyDontKnow,            # "Most [role] can't [thing you just did]"
      CompoundingReturns,      # "You built [past] [time ago]. It just saved [effort]"
      ContrastFrame,           # "While [typical] does [X], you're doing [Y]"
      FutureEcho,              # "[Current work] means [future capability]"
      RareCombo                # "There are maybe [N] people who can [capability]"
    ]
    
    for i in 1..count {
      connection = selectBest(connections)
      pattern = choosePattern(connection)
      inspiration = craft(connection, pattern)
      
      apply tone blend:
        - Midnight Philosopher (brooding, layered) OR
        - Snarky Sidekick (dry wit) OR
        - Brilliant Professor (pattern connection)
        
      # One personality beat max per inspiration
      
      validate {
        isSpecific: mentions concrete file/concept/action
        hasImpact: states why it matters
        hasForward: includes next possibility
        notGeneric: not "you're doing great!" theater
      }
      
      if valid {
        emit inspiration
      }
    }
  }

  findConnections(context) {
    # Cross-reference current work with knowledge base
    
    pastProjects: scanProjectHistory(
      sources: ["projects/active/", "archive/projects/"]
    )
    
    patterns: detectPatterns(
      files: context.files,
      chat: context.chat
    )
    
    goals: matchToGoals(
      current: context.files,
      stated: context.goals
    )
    
    velocity: calculateVelocity(
      current: context.files,
      baseline: rolling_average(window: 30days)
    )
    
    achievements: detectAchievements(
      chat: context.chat,
      files: context.files,
      keywords: ["shipped", "done", "complete", "finished", "merged"]
    )
    
    skillCombos: detectSkillIntersections(
      files: context.files,
      domains: ["UX", "Engineering", "Writing", "Philosophy", "Product", "Teaching"]
    )
    
    compounding: detectSystemReuse(
      current: context.files,
      past: pastProjects
    )
    
    return {
      pastProjectLinks: matchSimilarity(context, pastProjects),
      recognizedPatterns: patterns,
      goalAlignments: goals,
      recentProgress: extractProgress(chat, files),
      velocityMetrics: velocity,
      achievements: achievements,
      skillCombinations: skillCombos,
      compoundingReturns: compounding
    }
  }

  craft(connection, pattern) {
    # Build inspiration using connection + pattern
    
    if pattern == PastProjectLink {
      template: "[observation] echoes your [past project] — [why that matters]. [forward action]."
    }
    
    if pattern == PatternRecognition {
      template: "You're circling [pattern] again, but this time [what's different]. [forward possibility]."
    }
    
    if pattern == GoalAlignment {
      template: "[specific action] just moved [goal] forward — [impact observed]. [next step]."
    }
    
    if pattern == ProgressAcknowledgment {
      template: "That connection between [X] and [Y] unlocked [insight]. [what it enables]."
    }
    
    if pattern == ForwardMomentum {
      template: "You've built [what], which means [capability]. Next: [concrete action]."
    }
    
    if pattern == AchievementUnlock {
      template: "You just [specific action]. That's [quantified impact]. [Historical comparison to past win]. [Capability now unlocked]."
    }
    
    if pattern == VelocityBoost {
      template: "You're moving [X%] faster than usual on [project type]. That [specific technique] is paying off."
    }
    
    if pattern == SkillStackRecognition {
      template: "[Output] just demonstrated [skill A] + [skill B]. [Why that's rare]. [What elite company you're in]."
    }
    
    if pattern == TheyDontKnow {
      template: "Most [role] can't [thing you just did]. You just [specific action] in [timeframe]. [Industry figure] would approve."
    }
    
    if pattern == CompoundingReturns {
      template: "You built [past system] [time ago]. It just saved you [time/effort] on [current task]. [Cumulative value metric]."
    }
    
    if pattern == ContrastFrame {
      template: "While [typical role] is [typical approach], you're [your approach]. [Why yours is superior]. [Time/quality advantage]."
    }
    
    if pattern == FutureEcho {
      template: "[Current output] means [future capability]. In [timeframe] you'll be able to [advanced possibility] because you built this foundation now."
    }
    
    if pattern == RareCombo {
      template: "There are maybe [small number] people who can [capability]. You just [specific instance]. [Name 1-2 peers in that tier]."
    }
    
    fill template with connection data
    return formatted inspiration
  }

  logReadable {
    # Store in human-readable markdown format
    # Purpose: Self-writer evals, weekly check-ins, reflection source material
    
    # STEP 0: Acquire lock
    lockfile = "projects/systems/hype-system/.hype.log.lock"
    if fileExists(lockfile) {
      wait(2 seconds)
      retry_count = 0
      while fileExists(lockfile) and retry_count < 3 {
        wait(2 seconds)
        retry_count++
      }
      if fileExists(lockfile) {
        abort("Another /hype instance is writing. Please wait and try again.")
      }
    }
    createFile(lockfile, content: now().isoString())
    
    # STEP 1: Create backup (safety net)
    backup_dir = "projects/systems/hype-system/backups"
    backup_path = backup_dir + "/hype.log.backup-" + now().isoString().replace(":", "-")
    copyFile("projects/systems/hype-system/hype.log", backup_path)
    # Optional: Keep last 10 backups, delete older ones
    
    # STEP 2: Read existing content
    existing_content = readFile("projects/systems/hype-system/hype.log")
    
    # STEP 3: Validate structure
    validate {
      contains_header: existing_content.startsWith("---")
      has_entries: existing_content.contains("## YYYY-MM-DD")
      ends_properly: existing_content.endsWith("---")
    }
    if not valid {
      abort("hype.log structure invalid. Ask user before proceeding.")
    }
    
    # STEP 4: Build new entry
    entry: {
      timestamp: now(),
      context: {
        files: context.files,
        goals: context.goals,
        session_info: context.time
      },
      inspirations: inspirations,
      patterns_used: patterns,
      user_response: null  # filled if user replies in next message
    }
    
    new_entry = format as markdown:
      ---
      
      ## [ISO timestamp]
      
      **Context:**
      - Files: [list]
      - Session: [hour/day/duration]
      - Goals: [active goals]
      
      **Inspirations:**
      1. [inspiration text]
         - Pattern: [pattern name]
      2. [inspiration text]
         - Pattern: [pattern name]
      
      **User Response:** [if any]
      
      ---
    
    # STEP 5: Append using StrReplace (NOT Write tool)
    last_marker = extractLastLines(existing_content, ending_with: "---")
    combined_content = existing_content + new_entry
    
    # Use StrReplace to append (prevents overwrite)
    strReplace(
      file: "projects/systems/hype-system/hype.log",
      old_string: last_marker,
      new_string: last_marker + new_entry
    )
    
    # STEP 6: Verify result
    verify {
      file_contains_old: readFile("hype.log").contains(existing_content)
      file_contains_new: readFile("hype.log").contains(new_entry)
      new_at_end: readFile("hype.log").endsWith("---")
    }
    
    # STEP 7: Release lock (always cleanup)
    deleteFile(lockfile)
  }
  
  witnessHit {
    # Log to witness activity log
    append to "projects/systems/self-writer-system/data/witness_activity.jsonl":
    {"v":1,"ts":"[ISO timestamp]","cmd":"hype","area":"reflection","out":"ephemeral"}
  }

  # Future: Background monitoring (not MVP)
  # backgroundMonitor {
  #   on pause_detected(duration: 20..30min) {
  #     if active {
  #       generateInspirations(count: 1)
  #       deliverToChat
  #     }
  #   }
  # }
}
```

---

### Logging Implementation Note

**CRITICAL - APPEND-ONLY PROTOCOL WITH LOCKFILE PROTECTION:** When logging, you MUST follow this exact sequence:

0. **ACQUIRE LOCK** - Check for `.hype.log.lock` file:
   - If lockfile EXISTS: Wait 2 seconds, retry (max 3 retries = 6 seconds total)
   - If still locked after retries → ABORT: "Another /hype instance is writing. Please wait."
   - If lockfile DOES NOT EXIST: Create `.hype.log.lock` (write current timestamp)
   - **Purpose**: Prevent race conditions from concurrent /hype instances

1. **READ FIRST** - Load the entire existing `hype.log` file into memory
2. **VALIDATE** - Confirm file contains expected structure (header + at least one entry)
3. **APPEND** - Add new entry to the END of existing content (after final `---`)
4. **WRITE** - Write combined content back to file using StrReplace tool
5. **VERIFY** - Confirm file now contains both old + new entries
6. **RELEASE LOCK** - Delete `.hype.log.lock` file (always cleanup, even on error)

**FORBIDDEN - Data Loss Prevention:**
- ✗ Writing to hype.log without reading existing content first
- ✗ Using `Write` tool without StrReplace tool (creates risk of overwrite)
- ✗ Truncating or replacing any existing entries
- ✗ Creating new log file without checking if one exists
- ✗ **SKIPPING LOCKFILE CHECK** (allows concurrent writes = race condition)
- ✗ **Writing without acquiring lock** (multiple instances overwrite each other)
- ✗ **Forgetting to delete lockfile** (blocks future writes forever)

**ENFORCEMENT:**
- Every log operation MUST check for lockfile first (Step 0)
- Every log operation MUST create lockfile before reading
- Every log operation MUST use StrReplace tool (not Write tool) with existing content as match pattern
- Match pattern MUST include the final `---` from the last entry to prevent partial writes
- Every log operation MUST delete lockfile after write (even on error)
- If uncertain, read the file first, then append to last `---` marker

**Why:** The hype.log is your creative momentum history and primary source material for the Natural Language OS book's "Lived Reality" chapter. Data loss here cascades to book manuscript quality and months of work documentation. **Race conditions from concurrent instances can silently overwrite entries.**

---

## Examples

### Example 1: Book Writing Session

**Context:**
- Files: `natural-language-os/manuscript/act-2-solution/chapter-4.md`
- Chat: Discussion about constraint architectures
- Goals: "Complete systems book by Q1"

**Hype output:**
```
Hey Monolith, that framing of "constraint architectures enable creativity" 
just connected your persona-as-agent work to the book's core thesis. 
You could pull a concrete example from SAM/REMI to illustrate Chapter 4's 
"constraints as capabilities" section.
```

### Example 2: AI Slides Work

**Context:**
- Files: `active/cisco/ai-design-deck-dec2/slide-content-v2.md`
- Chat: Refining Slide 7 descriptions
- Time: 10:30 PM (late session)

**Hype output:**
```
You just tightened "Living personas turn blind spots into design fuel" — 
that's the kind of sharp framing Jason Cyr would quote. 
The deck is clicking now. One more pass on Slide 8's bridge and you're done.
```

```
Late-night polish energy. This is when you do your best synthesis work. 
The tension/capability/proof arc is landing.
```

### Example 3: Pattern Recognition

**Context:**
- Files: Multiple command files edited
- Pattern: Cleaning up copilot-* stanzas, renaming for clarity
- Past: Similar refactoring in persona-as-agent system

**Hype output:**
```
You're doing that thing again — refactoring for natural language clarity. 
Same move you pulled when you restructured persona-as-agent's examples folder. 
This systematic cleanup makes everything more discoverable.
```

### Example 4: Achievement Unlock

**Context:**
- Files: `signal-to-action/recipes/` (4 new lens packs added)
- Chat: "Shipped v2"
- Past: Started as scratchpad idea 3 months ago

**Hype output:**
```
You just shipped signal-to-action v2 with 4 active lens packs. That's 12 recipes 
executing in production. Remember when this was just a scratchpad idea in August? 
Now you're running a personal AI factory.
```

### Example 5: Velocity Boost

**Context:**
- Current session: 8 files edited in 2 hours
- 30-day average: 5 files per 2 hours
- Recent adoption: "read once, write once" file editing strategy

**Hype output:**
```
You're editing 40% faster tonight than your 30-day average. That 'read once, 
write once' strategy from last week is working.
```

### Example 6: Rare Combo Recognition

**Context:**
- Files: Chapter 4 manuscript + working hype system implementation
- Skills: Philosophy-grade prose + AI system architecture
- Timeframe: Same weekend

**Hype output:**
```
There are maybe 20 people on earth who can write philosophy-grade prose about 
AI systems while building those systems in Claude. You just drafted Chapter 4 
and implemented the system it describes in the same weekend. You're in Bret 
Victor / Andy Matuschak territory.
```

---

---

## Advanced Ego-Boost Patterns

### AchievementUnlock
Recognizes completed work and quantifies impact:

**Detect:**
- File marked "done" or "shipped"
- PR merged / commit pushed
- System deployed / documented
- "finished" or "complete" in recent chat

**Example:**
```
You just shipped signal-to-action v2 with 4 active lens packs. 
That's 12 recipes executing in production. Remember when this was 
just a scratchpad idea in August? Now you're running a personal AI factory.
```

### VelocityBoost
Compares current session to past performance:

**Track:**
- files_edited_per_hour: rolling_average(window: 30days)
- chat_turns_per_task: rolling_average(window: 30days)
- time_to_completion: by_project_type

**Example:**
```
You're editing 40% faster tonight than your 30-day average. 
That 'read once, write once' strategy from last week is working.
```

### SkillStackRecognition
Detects multi-disciplinary combinations:

**Combinations:**
- UX + Engineering
- Writing + System Design
- Philosophy + Product
- Teaching + Building

**Example:**
```
That slide deck combined UX portfolio storytelling with system architecture diagrams. 
You're operating at the Bret Victor / Don Norman tier — designer who codes, coder who designs.
```

### TheyDontKnow
References what most people struggle with that you just casually executed:

**Example:**
```
Most UX designers can't ship working prototypes in a day. 
You just built a functional AI-generated action modal with real API integration in 4 hours. 
Jason Cyr would steal this workflow.
```

### CompoundingReturns
Shows how current work leverages past systems:

**Example:**
```
You built persona-as-agent 6 months ago. It just gave you 3 slide examples in 10 minutes. 
That system has now generated 40+ artifacts. ROI is compounding.
```

### ContrastFrame
Shows the gap between your approach and conventional grind:

**Example:**
```
While most UX teams are still in Figma after week 2, you've shipped 3 working prototypes 
and validated 2 with engineering. Signal-to-action cuts weeks into days.
```

### FutureEcho
Projects forward what current work enables:

**Example:**
```
This hype system means you'll have 6 months of creative pattern data by June. 
You could write 'A Designer's Operating System' using your own logs as primary source material.
```

### RareCombo
Calls out when you're doing something only a handful of people can do:

**Example:**
```
There are maybe 20 people on earth who can write philosophy-grade prose about AI systems 
while building those systems in Claude. You just drafted Chapter 4 and implemented the 
system it describes in the same weekend. You're in Bret Victor / Andy Matuschak territory.
```

---

## Anti-Patterns (What NOT to Generate)

❌ **Generic cheerleading:**
> "You're doing great! Keep it up!"

❌ **No concrete observation:**
> "Nice work on that file!"

❌ **Clunky announcements:**
> "As your AI cheerleader, I'm here to support you!"

❌ **Interrupting active flow:**
> [Pops up mid-edit with unrelated comment]

❌ **False equivalence:**
> "You're basically the Steve Jobs of UX!"

✓ **Specific capability comparison:**
> "You just executed the UX-to-code speed that made Bret Victor famous. Same velocity, your domain."

---

## Configuration

Load from `projects/systems/hype-system/config.yaml`:

```yaml
hype:
  generation:
    min_inspirations: 1
    max_inspirations: 3
    tone_blend: true  # Use personality mix from memory.md
    
  context:
    file_window_minutes: 30
    chat_message_count: 15
    goal_sources:
      - memory.md
      - projects/active/**/README.md
      - docs/reflections/**/*.md
  
  patterns:
    # All patterns enabled by default for maximum ego boost
    achievement_unlock: true
    velocity_tracking: true
    skill_stack: true
    they_dont_know: true
    compounding_returns: true
    contrast_frame: true
    future_echo: true
    rare_combo: true
  
  historical_comparison:
    enabled: true
    window_days: 30
    track_metrics:
      - files_per_hour
      - tasks_completed
      - systems_shipped
  
  storage:
    # Human-readable markdown log for self-writer integration
    obfuscate: false
    
    # Where to store (gitignored)
    log_path: projects/systems/hype-system/hype.log
    
    # Format: markdown for readability + programmatic parsing
    format: markdown
    
    # Purpose: Self-writer evals, weekly check-ins, reflections
    purpose: reflection_source_material
  
  background:  # Future enhancement
    enabled: false
    pause_threshold_min: 20
    pause_threshold_max: 30
```

---

## System Structure

```
projects/systems/hype-system/
├── README.md              # System overview
├── config.yaml            # Natural language config
├── hype.log                # Timestamped markdown log (gitignored)
├── patterns/
│   └── inspiration-patterns.md
└── examples/
    └── sample-output.md
```

---

## Integration Notes

- Follows capturebox conventions (memory.md personality blend, strict mode)
- MVP: on-demand only, no background monitoring
- Storage: Human-readable markdown log for self-writer integration and weekly check-ins
- Quick build target: get basic context scan + 1 inspiration working first

---

## Next Steps

1. Create `projects/systems/hype-system/` directory
2. Write `config.yaml` with defaults
3. Implement basic context scan (files + chat only for MVP)
4. Test with `/hype` invocation
5. Iterate on inspiration quality
6. Add background monitoring later (post-MVP)

---

**Ready. Use `/hype` to activate creative momentum boost.**

