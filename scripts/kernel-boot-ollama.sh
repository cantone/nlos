#!/usr/bin/env bash
# kernel-boot-ollama.sh - Boot NL-OS kernel via Ollama
#
# Usage: ./scripts/kernel-boot-ollama.sh [--model MODEL] [--full] [--profile PROFILE]
#
# Generates system prompt from kernel files and launches Ollama session.
# The model will "boot" into Capturebox NL-OS mode with full kernel context.
#
# Options:
#   --model MODEL    Specify model (default: qwen2.5:3b from model-catalog.yaml)
#   --full           Load full tier including personalities and command map
#   --profile PROF   Use operational profile: speed, balanced, quality, memory_constrained
#   --dry-run        Print system prompt without launching Ollama
#   --help           Show this help message
#
# Examples:
#   ./scripts/kernel-boot-ollama.sh                          # Boot with default model
#   ./scripts/kernel-boot-ollama.sh --model llama3.1:8b      # Boot with specific model
#   ./scripts/kernel-boot-ollama.sh --full                   # Load full kernel context
#   ./scripts/kernel-boot-ollama.sh --profile quality        # Use quality profile
#   ./scripts/kernel-boot-ollama.sh --dry-run                # Preview system prompt

set -euo pipefail

# Resolve capturebox root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CAPTUREBOX_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Defaults
MODEL="qwen2.5:3b"
FULL_BOOT=false
DRY_RUN=false
PROFILE=""

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --model)
            MODEL="$2"
            shift 2
            ;;
        --full)
            FULL_BOOT=true
            shift
            ;;
        --profile)
            PROFILE="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            head -30 "$0" | tail -25
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Override model based on profile
if [[ -n "$PROFILE" ]]; then
    case $PROFILE in
        speed)
            MODEL="qwen2.5:3b"
            ;;
        balanced)
            MODEL="mistral:7b"
            ;;
        quality)
            MODEL="llama3.1:8b"
            ;;
        memory_constrained)
            MODEL="qwen2.5:3b"
            ;;
        *)
            echo -e "${RED}Unknown profile: $PROFILE${NC}"
            echo "Valid profiles: speed, balanced, quality, memory_constrained"
            exit 1
            ;;
    esac
fi

# Verify required files exist
echo -e "${BLUE}Verifying kernel files...${NC}"

MANDATORY_FILES=(
    "$CAPTUREBOX_ROOT/memory.md"
    "$CAPTUREBOX_ROOT/AGENTS.md"
    "$CAPTUREBOX_ROOT/axioms.yaml"
)

LAZY_FILES=(
    "$CAPTUREBOX_ROOT/personalities.md"
    "$CAPTUREBOX_ROOT/.cursor/commands/COMMAND-MAP.md"
)

for file in "${MANDATORY_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo -e "${RED}CRITICAL: Missing mandatory file: $file${NC}"
        exit 1
    fi
done

# Build kernel payload
echo -e "${BLUE}Building kernel payload...${NC}"

PAYLOAD="# Capturebox NL-OS Kernel Context

You are booting into Capturebox NL-OS. The following kernel context defines your operational parameters. Read and internalize these instructions before responding.

After processing this context, acknowledge with: \"Kernel loaded. Ready for capturebox operations.\"

---

## memory.md (Behavioral Directives)

$(cat "$CAPTUREBOX_ROOT/memory.md")

---

## AGENTS.md (Hard Invariants)

$(cat "$CAPTUREBOX_ROOT/AGENTS.md")

---

## axioms.yaml (Canonical Definitions)

$(cat "$CAPTUREBOX_ROOT/axioms.yaml")
"

if [[ "$FULL_BOOT" == true ]]; then
    echo -e "${BLUE}Including lazy tier files...${NC}"

    PAYLOAD+="

---

## personalities.md (Voice Presets)

$(cat "$CAPTUREBOX_ROOT/personalities.md")

---

## COMMAND-MAP.md (Command Registry)

$(cat "$CAPTUREBOX_ROOT/.cursor/commands/COMMAND-MAP.md")
"
fi

# Calculate approximate token count (rough estimate: 4 chars per token)
CHAR_COUNT=${#PAYLOAD}
TOKEN_ESTIMATE=$((CHAR_COUNT / 4))

echo -e "${GREEN}Kernel payload built: ~$TOKEN_ESTIMATE tokens${NC}"

# Dry run - just print the payload
if [[ "$DRY_RUN" == true ]]; then
    echo -e "${YELLOW}=== DRY RUN: System Prompt ===${NC}"
    echo "$PAYLOAD"
    echo -e "${YELLOW}=== END DRY RUN ===${NC}"
    exit 0
fi

# Check if Ollama is running
if ! command -v ollama &> /dev/null; then
    echo -e "${RED}Error: Ollama is not installed or not in PATH${NC}"
    echo "Install Ollama from: https://ollama.ai"
    exit 1
fi

if ! ollama list &> /dev/null; then
    echo -e "${RED}Error: Ollama is not running${NC}"
    echo "Start Ollama with: ollama serve"
    exit 1
fi

# Check if model is available
if ! ollama list | grep -q "^$MODEL"; then
    echo -e "${YELLOW}Model $MODEL not found locally. Pulling...${NC}"
    ollama pull "$MODEL"
fi

# Launch Ollama with kernel context
echo -e "${GREEN}Booting Capturebox NL-OS via Ollama ($MODEL)...${NC}"
echo -e "${BLUE}Tier: $(if [[ "$FULL_BOOT" == true ]]; then echo "FULL"; else echo "MANDATORY"; fi)${NC}"
echo ""

# Create a temporary file for the system prompt
TEMP_PROMPT=$(mktemp)
echo "$PAYLOAD" > "$TEMP_PROMPT"

# Launch interactive session
# Note: Ollama's --system flag has length limits, so we use a different approach
# We'll send the system prompt as the first message context
ollama run "$MODEL" <<< "/set system $PAYLOAD

Acknowledge that you have loaded the Capturebox NL-OS kernel and are ready for operations."

# Cleanup
rm -f "$TEMP_PROMPT"
