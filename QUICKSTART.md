# NL-OS Quick Start Guide

Get the Natural Language Operating System running in under 5 minutes.

---

## Prerequisites

Choose ONE of:
- **Ollama** (recommended) - [ollama.ai](https://ollama.ai)
- **LM Studio** - [lmstudio.ai](https://lmstudio.ai)
- **llama.cpp** - [github.com/ggerganov/llama.cpp](https://github.com/ggerganov/llama.cpp)
- **Any LLM with a chat interface** (Claude, ChatGPT, etc.)

---

## Method 1: npm Install (Recommended)

```bash
# Install the CLI globally
npm install -g nlos

# Pull a model (if using Ollama)
ollama pull qwen2.5:3b

# Boot NL-OS
nlos boot
```

That's it. You're in NL-OS mode.

### CLI Commands

```bash
nlos boot                    # Boot with default model (qwen2.5:3b)
nlos boot --model llama3.1:8b   # Boot with specific model
nlos boot --full             # Load full kernel (includes personalities)
nlos boot --dry-run          # Preview system prompt without launching

nlos payload                 # Generate portable payload file
nlos payload --tier full     # Full kernel payload
nlos payload --format json   # JSON format for API use

nlos verify                  # Check kernel files exist
nlos tokens                  # Show token estimates
```

---

## Method 2: Clone and Run

```bash
# Clone the repository
git clone https://github.com/yourusername/capturebox.git
cd capturebox

# Option A: Use the boot script (Ollama)
./scripts/kernel-boot-ollama.sh

# Option B: Use Make
make kernel.boot
```

---

## Method 3: Manual Paste (Any LLM)

Works with Claude, ChatGPT, Gemini, or any chat interface.

1. Open the file: `portable/kernel-payload.md`
2. Copy the entire contents (Cmd+A, Cmd+C)
3. Paste into a new chat as your first message
4. Wait for acknowledgment: "Kernel loaded. Ready for capturebox operations."

**Tip for macOS:**
```bash
cat portable/kernel-payload.md | pbcopy
# Now paste into any chat
```

---

## Verify It's Working

After boot, test these:

```
What constraints are you operating under?
```
Model should mention: no emojis, append-only logs, patch-style edits.

```
./hype
```
Model should generate a context-aware creative boost.

```
What systems are available?
```
Model should list cognitive frameworks like lateral-os, signal-to-action, etc.

---

## Configuration

### Change Default Model

Edit `KERNEL.yaml`:

```yaml
platforms:
  ollama:
    default_model: llama3.1:8b  # Change from qwen2.5:3b
```

Or use command line:
```bash
nlos boot --model mistral:7b
```

### Operational Profiles

| Profile | Model | Use Case |
|---------|-------|----------|
| speed | qwen2.5:3b | Fast responses, batch work |
| balanced | mistral:7b | General use |
| quality | llama3.1:8b | Deep analysis, synthesis |

```bash
nlos boot --profile quality
```

---

## Common Workflows

### Daily Start
```bash
nlos boot
# You're now in NL-OS mode for the session
```

### Creative Work
```bash
nlos boot --full --profile quality
# Full kernel with personalities, using best model
```

### Quick Extraction
```bash
nlos boot --profile speed
# Fast model for quick tasks
```

### Offline Work
```bash
# Ensure model is pulled first
ollama pull llama3.1:8b

# Boot offline (no internet needed)
nlos boot --model llama3.1:8b
```

---

## Troubleshooting

### "Ollama not found"
```bash
# Install Ollama
brew install ollama   # macOS
# or download from ollama.ai

# Start the server
ollama serve
```

### "Model not found"
```bash
# Pull the model first
ollama pull qwen2.5:3b
ollama pull llama3.1:8b  # for quality mode
```

### "Context too long"
Use a model with larger context window, or use mandatory tier only:
```bash
nlos boot --tier mandatory
```

### Model doesn't follow rules
Some smaller models may not follow all kernel rules. Try:
- Larger model (7B+)
- Repeat key constraints in your first message
- Use `--profile quality`

---

## Next Steps

1. **Explore commands**: Run `./sys-ref` to see all 57+ slash commands
2. **Try personalities**: Run `./assume Quentin` for a different voice
3. **Build workflows**: Create your own commands in `.cursor/commands/`
4. **Read the philosophy**: See `projects/systems/natural-language-os/` for the book

---

## File Locations

| What | Where |
|------|-------|
| Kernel entry point | `KERNEL.md` |
| Configuration | `KERNEL.yaml` |
| Behavioral rules | `memory.md` |
| Safety invariants | `AGENTS.md` |
| Slash commands | `.cursor/commands/` |
| Cognitive systems | `projects/systems/` |
| Portable payloads | `portable/` |

---

## Getting Help

- **In-session**: Ask "What commands are available?"
- **Documentation**: See `portable/README.md`
- **Issues**: [github.com/yourusername/capturebox/issues](https://github.com/yourusername/capturebox/issues)

---

*Time to boot: ~2 minutes with Ollama, ~30 seconds with manual paste.*
