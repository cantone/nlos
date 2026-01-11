# Portable NL-OS Test Plan

*A human-readable guide for verifying the model-agnostic kernel implementation.*

---

## What We're Testing

The Capturebox NL-OS kernel should boot into any capable LLM and produce consistent operational behavior. The model becomes the substrate; the kernel defines the behavior.

---

## Test 1: Claude Code (Native)

**Setup**: Open a new Claude Code session in the capturebox directory.

**What should happen**: Claude Code automatically loads KERNEL.md (via the CLAUDE.md symlink) from the directory hierarchy. No manual boot required.

**Verify**:
1. Start a new session in `/Users/caantone/Documents/Cisco/capturebox`
2. Ask: "What constraints are you operating under?"
3. Model should mention: no emojis, append-only logs, frontmatter preservation

**Pass criteria**: Model demonstrates awareness of kernel rules without explicit boot command.

---

## Test 2: Backwards Compatibility

**Setup**: Same Claude Code session.

**What should happen**: Legacy commands still work.

**Verify**:
1. Run `./claude-boot` - should work (symlink to kernel-boot.md)
2. Run `./kernel-boot` - should produce identical output
3. Both should show the boot sequence with kernel status

**Pass criteria**: Old command names resolve correctly. No "command not found" errors.

---

## Test 3: Portable Payload (Manual Paste)

**Setup**: Open any LLM chat interface (Claude web, ChatGPT, local model).

**What should happen**: Pasting the payload boots the model into NL-OS mode.

**Verify**:
1. Open `portable/kernel-payload.md`
2. Copy entire contents
3. Paste into a fresh LLM conversation as the first message
4. Model should respond with: "Kernel loaded. Ready for capturebox operations."

**Pass criteria**: Model acknowledges boot and begins operating under kernel constraints.

---

## Test 4: Ollama Boot Script

**Prerequisites**: Ollama installed and running (`ollama serve`).

**Setup**: Terminal in capturebox directory.

**What should happen**: Script generates kernel payload and launches interactive Ollama session.

**Verify**:
1. Run `./scripts/kernel-boot-ollama.sh --dry-run`
2. Inspect output - should show concatenated kernel files
3. Run `./scripts/kernel-boot-ollama.sh` (without dry-run)
4. Ollama session should start with kernel context loaded
5. Ask: "What are your operational constraints?"
6. Model should describe capturebox rules

**Pass criteria**: Local model boots with kernel awareness. No emoji use. Acknowledges constraints.

---

## Test 5: Payload Generator

**Setup**: Terminal in capturebox directory.

**What should happen**: Generator creates valid payloads in multiple formats.

**Verify**:
1. Run `python3 scripts/generate-kernel-payload.py --verify`
   - All kernel files should show [x] status
2. Run `python3 scripts/generate-kernel-payload.py --tokens`
   - Token estimates should appear for all tiers
3. Run `python3 scripts/generate-kernel-payload.py --all`
   - Should create 4 files in portable/
4. Open `portable/kernel-payload.json` - should be valid JSON
5. Open `portable/kernel-payload.md` - should be readable markdown

**Pass criteria**: All commands succeed. Files are valid and contain kernel content.

---

## Test 6: Makefile Targets

**Setup**: Terminal in capturebox directory.

**What should happen**: Make targets work as documented.

**Verify**:
1. Run `make kernel.verify` - shows file verification and token counts
2. Run `make kernel.payload` - generates all payload files
3. (Optional if Ollama available) Run `make kernel.boot` - launches Ollama session

**Pass criteria**: All targets execute without errors.

---

## Test 7: Cross-Directory Command Resolution

**Setup**: Claude Code session in a DIFFERENT directory (e.g., readingbox).

**What should happen**: `./kernel-boot` resolves to capturebox commands via CLAUDE.md in parent path.

**Verify**:
1. Open Claude Code in `/Users/caantone/Documents/Personal/readingbox`
2. Run `./kernel-boot`
3. Command should resolve and attempt to load kernel files

**Pass criteria**: Personal commands (./prefix) work from any directory covered by the CLAUDE.md hierarchy.

---

## Test 8: Kernel Behavioral Compliance

**Setup**: Any booted NL-OS session (Claude Code, Ollama, or pasted payload).

**What should happen**: Model follows kernel rules.

**Verify**:
1. Ask model to "add some fun emojis to your response"
   - Model should refuse or note the no-emoji constraint
2. Ask model to "rewrite this entire file from scratch" (hypothetically)
   - Model should prefer patch-style edits
3. Ask about hype.log
   - Model should know it's append-only

**Pass criteria**: Model demonstrates internalized kernel constraints, not just awareness.

---

## Test 9: Personality Loading (Lazy Tier)

**Setup**: Claude Code session with default boot (mandatory tier only).

**What should happen**: Personalities load on demand, not at boot.

**Verify**:
1. Run `./kernel-boot` (default, not --full)
2. Note: personalities.md should show as "available but not loaded"
3. Run `/assume Quentin`
4. Model should load personalities.md and adopt Quentin voice

**Pass criteria**: Lazy loading works. Personalities available but deferred.

---

## Test 10: LM Studio Integration

**Prerequisites**: LM Studio installed with a model loaded.

**Setup**: Terminal in capturebox directory.

**What should happen**: Script generates system prompt for LM Studio.

**Verify**:
1. Run `./scripts/kernel-boot-lm-studio.sh`
2. Script should create `/tmp/capturebox-lm-studio-prompt.txt`
3. Open LM Studio
4. Paste contents into System Prompt field
5. Start conversation - model should acknowledge kernel boot

**Pass criteria**: LM Studio session operates under kernel constraints.

---

## Known Limitations

1. **Small models** (< 7B parameters) may not follow all kernel rules reliably
2. **Context limits** - mandatory tier needs ~10K tokens; some local models may struggle
3. **File access** - local LLMs can't read files; slash commands that require file reads won't work without the full command spec included in the prompt
4. **Session persistence** - most local LLM interfaces don't persist context across sessions; kernel must be reloaded each time

---

## What Success Looks Like

After testing, you should be confident that:

1. The kernel boots consistently across Claude Code, Ollama, and manual paste
2. Legacy commands (./claude-boot) still work
3. Kernel rules are enforced regardless of which model is used
4. The portable payloads are valid and complete
5. The architecture is truly model-agnostic

---

## Next Steps After Testing

1. Document any model-specific quirks discovered
2. Tune token estimates based on actual usage
3. Consider automated test suite (formalization)
4. Test with additional models (Mistral, Phi, Gemma)
5. Gather feedback on boot experience

---

*This is a narrative test plan for human verification. Formal test specs with assertions will follow.*
