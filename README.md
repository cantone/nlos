# NL-OS: Natural Language Operating System

A model-agnostic kernel that turns any LLM into a cognitive operating system.

```
npm install -g nlos
nlos boot
```

---

## What is NL-OS?

NL-OS inverts the traditional AI relationship: **you are the intelligent agent; the model is the substrate.**

Instead of asking an AI to do things for you, NL-OS provides a structured environment where you think *through* the model. The kernel defines behavioral rules, operational constraints, and cognitive frameworks that persist across sessions and work with any capable LLM.

## Key Features

- **Model-agnostic** - Works with Claude, GPT-4, Llama, Mistral, Qwen, or any LLM
- **Portable kernel** - Same behavioral rules across all runtimes
- **57+ slash commands** - Executable workflows defined in natural language
- **17 cognitive systems** - Reusable frameworks for ideation, writing, design, and more
- **Zero dependencies on APIs** - Pure text-based instruction set

## Quick Start

### Option 1: npm (Recommended)

```bash
# Install globally
npm install -g nlos

# Boot with Ollama (default)
nlos boot

# Boot with specific model
nlos boot --model llama3.1:8b

# Generate portable payload
nlos payload
```

### Option 2: Direct Use

```bash
# Clone the kernel
git clone https://github.com/yourusername/capturebox.git
cd capturebox

# Boot via Ollama
./scripts/kernel-boot-ollama.sh

# Or generate a payload and paste into any LLM
cat portable/kernel-payload.md | pbcopy
```

### Option 3: Manual Paste

1. Open [portable/kernel-payload.md](portable/kernel-payload.md)
2. Copy the entire contents
3. Paste into any LLM chat as your first message
4. The model acknowledges: "Kernel loaded. Ready for capturebox operations."

## Supported Runtimes

| Runtime | Command | Notes |
|---------|---------|-------|
| Ollama | `nlos boot` | Default, any Ollama model |
| llama.cpp | `nlos boot --runtime llama-cpp` | GGUF models |
| LM Studio | `nlos boot --runtime lm-studio` | GUI or API |
| Claude Code | Native | Auto-loads from directory |
| Cursor IDE | Native | Via .cursorrules |
| Any LLM | `nlos payload` | Copy/paste system prompt |

## Architecture

```
KERNEL.md              # Entry point (auto-loaded by Claude Code/Cursor)
KERNEL.yaml            # Platform/model configuration
memory.md              # Behavioral directives (~4.6K tokens)
AGENTS.md              # Hard invariants and safety rules (~1.2K tokens)
axioms.yaml            # Canonical definitions (~4.8K tokens)
personalities.md       # Voice presets (lazy-loaded)
.cursor/commands/      # 57+ slash command specs
projects/systems/      # 17 cognitive frameworks
portable/              # Standalone boot payloads
```

### Boot Tiers

| Tier | Tokens | Contents |
|------|--------|----------|
| Mandatory | ~10,600 | memory.md, AGENTS.md, axioms.yaml |
| Lazy | +4,950 | personalities.md, COMMAND-MAP.md |
| Full | ~15,500 | All kernel files |

## Core Concepts

### The Fundamental Inversion

Traditional AI: "AI, write me a report."
NL-OS: "I will think through this problem using the model as my cognitive substrate."

The model doesn't produce answers *for* you. You produce understanding *through* the model.

### Slash Commands

Commands are protocol specifications, not code. Any LLM that reads the spec can execute it.

```
./kernel-boot          # Initialize NL-OS
./hype                 # Creative momentum boost
./ux-writer            # Generate UI copy
./design-spec          # Create design specifications
./assume Quentin       # Adopt a personality preset
```

### Cognitive Systems

Reusable frameworks for different thinking modes:

- **lateral-os** - Ideation with dimensional analysis
- **signal-to-action** - Transform inputs into structured outputs
- **persona-as-agent** - Research through security personas
- **self-writer-system** - Reflection and performance reviews
- **hype-system** - Creative momentum tracking

## Configuration

Edit `KERNEL.yaml` to customize:

```yaml
runtime:
  current: ollama           # or: claude_code, cursor, llama_cpp, lm_studio

platforms:
  ollama:
    default_model: qwen2.5:3b

local_llm:
  default_profile: balanced  # or: speed, quality, memory_constrained
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Generate all payloads
make kernel.payload

# Verify kernel files
make kernel.verify
```

## Philosophy

1. **Human epistemic control** - You decide what's true; the model helps you think
2. **Cognitive acceleration** - Systems scaffold thinking, not replace it
3. **Evidence-first** - All claims trace to sources
4. **Natural language as infrastructure** - Everything is human-readable
5. **Portability by design** - Works anywhere, depends on nothing

## FAQ

**Q: Why not just use Claude/GPT directly?**

A: You can. NL-OS adds persistent behavioral rules, reusable workflows, and cognitive frameworks that survive across sessions. It's the difference between a blank canvas and an equipped studio.

**Q: Does this require an internet connection?**

A: No. Run entirely offline with Ollama, llama.cpp, or LM Studio. The kernel is just text files.

**Q: What models work best?**

A: Any model with 16K+ context and good instruction-following. Tested with Claude, GPT-4, Llama 3.1, Mistral, and Qwen 2.5.

**Q: Can I customize the kernel?**

A: Yes. Edit memory.md for behavioral rules, add commands to .cursor/commands/, create new systems in projects/systems/.

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Test with multiple LLM runtimes
4. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

*NL-OS: Think through machines, not at them.*
