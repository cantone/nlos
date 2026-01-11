# Portable NL-OS Boot Payloads

This directory contains standalone boot payloads for running Capturebox NL-OS on **any LLM**.

## What Are These Files?

Boot payloads are self-contained kernel contexts. Feed them to any capable LLM as system prompt or initial context, and the model will "boot" into Capturebox NL-OS mode with full operational capabilities.

## Files

| File | Tier | Tokens | Use Case |
|------|------|--------|----------|
| `kernel-payload.md` | Mandatory | ~10,600 | Default - behavioral directives only |
| `kernel-payload-full.md` | Full | ~15,500 | Complete kernel with personalities |
| `kernel-payload.json` | Mandatory | ~10,600 | API integration (OpenAI-compatible) |
| `kernel-payload-full.json` | Full | ~15,500 | API integration (full kernel) |

## Quick Start

### Ollama

```bash
# Boot with default model
./scripts/kernel-boot-ollama.sh

# Boot with specific model
./scripts/kernel-boot-ollama.sh --model llama3.1:8b

# Full kernel boot
./scripts/kernel-boot-ollama.sh --full
```

### llama.cpp

```bash
# Generate prompt file
./scripts/kernel-boot-llama-cpp.sh

# Use with llama-cli
llama-cli -m model.gguf -f /tmp/capturebox-kernel-prompt.txt --interactive
```

### LM Studio

```bash
# Generate system prompt
./scripts/kernel-boot-lm-studio.sh

# Copy to clipboard (macOS)
cat /tmp/capturebox-lm-studio-prompt.txt | pbcopy
```

Then paste into LM Studio's System Prompt field.

### Any LLM (Manual)

1. Copy contents of `kernel-payload.md`
2. Paste as system prompt or initial context
3. Model acknowledges: "Kernel loaded. Ready for capturebox operations."

### API Integration (OpenAI-compatible)

```python
import json

# Load kernel payload
with open("portable/kernel-payload.json") as f:
    payload = json.load(f)

# Build system message
system_content = "\n\n".join(
    f["content"] for f in payload["files"]
)

messages = [
    {"role": "system", "content": system_content},
    {"role": "user", "content": "Acknowledge kernel boot."}
]

# Send to any OpenAI-compatible API
response = client.chat.completions.create(
    model="your-model",
    messages=messages
)
```

## Regenerating Payloads

```bash
# Generate mandatory tier (default)
python3 scripts/generate-kernel-payload.py

# Generate full tier
python3 scripts/generate-kernel-payload.py --tier full

# Generate all variants
python3 scripts/generate-kernel-payload.py --all

# JSON format for API use
python3 scripts/generate-kernel-payload.py --format json

# Verify source files exist
python3 scripts/generate-kernel-payload.py --verify

# Show token estimates
python3 scripts/generate-kernel-payload.py --tokens
```

## Makefile Targets

```bash
# Generate all payloads
make kernel.payload

# Boot via Ollama
make kernel.boot

# Verify kernel files
make kernel.verify
```

## Supported Runtimes

| Runtime | Boot Method | Notes |
|---------|-------------|-------|
| Claude Code | Native (KERNEL.md auto-loaded) | No payload needed |
| Cursor IDE | Native (.cursorrules) | No payload needed |
| Ollama | `kernel-boot-ollama.sh` | Any Ollama model |
| llama.cpp | `kernel-boot-llama-cpp.sh` | GGUF models |
| LM Studio | `kernel-boot-lm-studio.sh` | GUI or API |
| OpenAI API | JSON payload | GPT-4, GPT-4o, etc. |
| Anthropic API | JSON payload | Claude models |
| Any LLM | Markdown payload | Manual paste |

## Tier Comparison

### Mandatory (~10,600 tokens)

Loads:
- `memory.md` - Behavioral directives, tone, style
- `AGENTS.md` - Hard invariants, safety protocols
- `axioms.yaml` - Canonical definitions, boot order

Capabilities: Full operational mode, all slash commands, all systems.

### Full (~15,500 tokens)

Adds:
- `personalities.md` - Voice presets (Quentin, Doctor X, Hugh Ashworth)
- `COMMAND-MAP.md` - Full command registry

Capabilities: Everything in mandatory + immediate access to `/assume` personalities and command reference.

### When to Use Each

- **Mandatory**: Default choice. Personalities load lazily when `/assume` is called.
- **Full**: When you know you'll use personalities or need command reference immediately.

## Architecture

The NL-OS kernel is model-agnostic because it's built on **natural language as infrastructure**:

- Commands are protocol specifications, not API wrappers
- Systems are cognitive frameworks, not automation scripts
- Behavioral rules are natural language directives, not code

Any model that can:
1. Read and understand text
2. Follow complex instructions
3. Maintain context

...can boot into Capturebox NL-OS mode.

## Verification

After loading a payload, the model should acknowledge:

> Kernel loaded. Ready for capturebox operations.

If the model doesn't acknowledge, verify:
1. The full payload was loaded (check token count)
2. The model has sufficient context window (minimum 16K tokens)
3. The model can follow complex instructions

## Troubleshooting

### "Context too long" errors

Use the mandatory tier (~10.6K tokens) instead of full tier. Most models with 16K+ context can handle it.

### Model doesn't follow kernel rules

Some smaller models may not follow all behavioral directives. Try:
1. A larger model (7B+ parameters)
2. Reinforcing specific rules in your first message
3. Using the "quality" profile with Ollama

### Commands not recognized

The kernel defines command resolution, but the model still needs to read command files. For local LLMs without file access, you may need to include specific command specs in your prompts.

## Contributing

To improve the portable boot experience:
1. Test with new models and document results
2. Optimize token usage in kernel files
3. Add support for new runtimes

File issues at: https://github.com/anthropics/capturebox (if public) or contact the maintainer.
