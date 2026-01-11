#!/usr/bin/env bash
# kernel-boot-llama-cpp.sh - Boot NL-OS kernel via llama.cpp
#
# Usage: ./scripts/kernel-boot-llama-cpp.sh [--model PATH] [--full] [--output FILE]
#
# Generates a prompt file from kernel files for use with llama.cpp CLI.
# You can then run: llama-cli -m model.gguf -f prompt.txt --interactive
#
# Options:
#   --model PATH     Path to GGUF model file (optional, for direct launch)
#   --full           Load full tier including personalities and command map
#   --output FILE    Output prompt file (default: /tmp/capturebox-kernel-prompt.txt)
#   --ctx-size N     Context size in tokens (default: 16384)
#   --launch         Launch llama-cli directly (requires --model)
#   --help           Show this help message
#
# Examples:
#   ./scripts/kernel-boot-llama-cpp.sh                              # Generate prompt file
#   ./scripts/kernel-boot-llama-cpp.sh --full                       # Full kernel context
#   ./scripts/kernel-boot-llama-cpp.sh --output ~/kernel.txt        # Custom output path
#   ./scripts/kernel-boot-llama-cpp.sh --model ~/llama3.gguf --launch  # Direct launch

set -euo pipefail

# Resolve capturebox root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CAPTUREBOX_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Defaults
MODEL_PATH=""
FULL_BOOT=false
OUTPUT_FILE="/tmp/capturebox-kernel-prompt.txt"
CTX_SIZE=16384
LAUNCH=false

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
            MODEL_PATH="$2"
            shift 2
            ;;
        --full)
            FULL_BOOT=true
            shift
            ;;
        --output)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        --ctx-size)
            CTX_SIZE="$2"
            shift 2
            ;;
        --launch)
            LAUNCH=true
            shift
            ;;
        --help|-h)
            head -25 "$0" | tail -20
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Verify required files exist
echo -e "${BLUE}Verifying kernel files...${NC}"

MANDATORY_FILES=(
    "$CAPTUREBOX_ROOT/memory.md"
    "$CAPTUREBOX_ROOT/AGENTS.md"
    "$CAPTUREBOX_ROOT/axioms.yaml"
)

for file in "${MANDATORY_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo -e "${RED}CRITICAL: Missing mandatory file: $file${NC}"
        exit 1
    fi
done

# Build kernel payload
echo -e "${BLUE}Building kernel prompt file...${NC}"

# llama.cpp prompt format with system instruction
PROMPT="<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are booting into Capturebox NL-OS. The following kernel context defines your operational parameters. Read and internalize these instructions before responding.

# Capturebox NL-OS Kernel Context

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

    PROMPT+="

---

## personalities.md (Voice Presets)

$(cat "$CAPTUREBOX_ROOT/personalities.md")

---

## COMMAND-MAP.md (Command Registry)

$(cat "$CAPTUREBOX_ROOT/.cursor/commands/COMMAND-MAP.md")
"
fi

# Close system header and add user prompt
PROMPT+="

After processing this context, acknowledge with: \"Kernel loaded. Ready for capturebox operations.\"

<|eot_id|><|start_header_id|>user<|end_header_id|>

Please acknowledge that you have loaded the Capturebox NL-OS kernel.<|eot_id|><|start_header_id|>assistant<|end_header_id|>

"

# Calculate approximate token count
CHAR_COUNT=${#PROMPT}
TOKEN_ESTIMATE=$((CHAR_COUNT / 4))

# Write prompt file
echo "$PROMPT" > "$OUTPUT_FILE"

echo -e "${GREEN}Kernel prompt file created: $OUTPUT_FILE${NC}"
echo -e "${GREEN}Approximate tokens: ~$TOKEN_ESTIMATE${NC}"
echo -e "${BLUE}Tier: $(if [[ "$FULL_BOOT" == true ]]; then echo "FULL"; else echo "MANDATORY"; fi)${NC}"

# Provide usage instructions
echo ""
echo -e "${YELLOW}To use with llama.cpp:${NC}"
echo "  llama-cli -m /path/to/model.gguf -f $OUTPUT_FILE --interactive --ctx-size $CTX_SIZE"
echo ""
echo "Or with llama-server:"
echo "  llama-server -m /path/to/model.gguf --ctx-size $CTX_SIZE"
echo "  Then POST the prompt content to /completion endpoint"

# Launch if requested
if [[ "$LAUNCH" == true ]]; then
    if [[ -z "$MODEL_PATH" ]]; then
        echo -e "${RED}Error: --launch requires --model PATH${NC}"
        exit 1
    fi

    if [[ ! -f "$MODEL_PATH" ]]; then
        echo -e "${RED}Error: Model file not found: $MODEL_PATH${NC}"
        exit 1
    fi

    if ! command -v llama-cli &> /dev/null; then
        echo -e "${RED}Error: llama-cli not found in PATH${NC}"
        echo "Build llama.cpp and add to PATH, or use the prompt file manually"
        exit 1
    fi

    echo ""
    echo -e "${GREEN}Launching llama-cli with kernel context...${NC}"
    llama-cli -m "$MODEL_PATH" -f "$OUTPUT_FILE" --interactive --ctx-size "$CTX_SIZE"
fi
