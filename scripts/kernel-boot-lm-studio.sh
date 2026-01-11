#!/usr/bin/env bash
# kernel-boot-lm-studio.sh - Boot NL-OS kernel via LM Studio
#
# Usage: ./scripts/kernel-boot-lm-studio.sh [--full] [--output FILE] [--json]
#
# Generates a system prompt file for import into LM Studio.
# Copy the output to LM Studio's System Prompt field or use the API.
#
# Options:
#   --full           Load full tier including personalities and command map
#   --output FILE    Output file (default: /tmp/capturebox-lm-studio-prompt.txt)
#   --json           Output as JSON for LM Studio API (OpenAI-compatible format)
#   --api            Send directly to LM Studio local API (http://localhost:1234)
#   --help           Show this help message
#
# Examples:
#   ./scripts/kernel-boot-lm-studio.sh                      # Generate system prompt
#   ./scripts/kernel-boot-lm-studio.sh --full               # Full kernel context
#   ./scripts/kernel-boot-lm-studio.sh --json               # JSON format for API
#   ./scripts/kernel-boot-lm-studio.sh --api                # Direct API call

set -euo pipefail

# Resolve capturebox root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CAPTUREBOX_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Defaults
FULL_BOOT=false
OUTPUT_FILE="/tmp/capturebox-lm-studio-prompt.txt"
JSON_OUTPUT=false
API_MODE=false
LM_STUDIO_URL="http://localhost:1234/v1/chat/completions"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --full)
            FULL_BOOT=true
            shift
            ;;
        --output)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        --json)
            JSON_OUTPUT=true
            shift
            ;;
        --api)
            API_MODE=true
            JSON_OUTPUT=true
            shift
            ;;
        --help|-h)
            head -22 "$0" | tail -17
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
echo -e "${BLUE}Building kernel payload for LM Studio...${NC}"

SYSTEM_PROMPT="You are booting into Capturebox NL-OS. The following kernel context defines your operational parameters. Read and internalize these instructions before responding.

After processing this context, acknowledge with: \"Kernel loaded. Ready for capturebox operations.\"

---

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

    SYSTEM_PROMPT+="

---

## personalities.md (Voice Presets)

$(cat "$CAPTUREBOX_ROOT/personalities.md")

---

## COMMAND-MAP.md (Command Registry)

$(cat "$CAPTUREBOX_ROOT/.cursor/commands/COMMAND-MAP.md")
"
fi

# Calculate approximate token count
CHAR_COUNT=${#SYSTEM_PROMPT}
TOKEN_ESTIMATE=$((CHAR_COUNT / 4))

echo -e "${GREEN}Kernel payload built: ~$TOKEN_ESTIMATE tokens${NC}"
echo -e "${BLUE}Tier: $(if [[ "$FULL_BOOT" == true ]]; then echo "FULL"; else echo "MANDATORY"; fi)${NC}"

# Output format
if [[ "$JSON_OUTPUT" == true ]]; then
    # Escape the system prompt for JSON
    ESCAPED_PROMPT=$(echo "$SYSTEM_PROMPT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')

    JSON_PAYLOAD="{
  \"model\": \"local-model\",
  \"messages\": [
    {
      \"role\": \"system\",
      \"content\": $ESCAPED_PROMPT
    },
    {
      \"role\": \"user\",
      \"content\": \"Please acknowledge that you have loaded the Capturebox NL-OS kernel.\"
    }
  ],
  \"temperature\": 0.7,
  \"max_tokens\": -1,
  \"stream\": false
}"

    if [[ "$API_MODE" == true ]]; then
        echo -e "${YELLOW}Sending to LM Studio API...${NC}"

        # Check if LM Studio is running
        if ! curl -s --connect-timeout 2 "$LM_STUDIO_URL" > /dev/null 2>&1; then
            echo -e "${RED}Error: LM Studio API not reachable at $LM_STUDIO_URL${NC}"
            echo "Make sure LM Studio is running with 'Start Server' enabled"
            exit 1
        fi

        # Send request
        RESPONSE=$(curl -s "$LM_STUDIO_URL" \
            -H "Content-Type: application/json" \
            -d "$JSON_PAYLOAD")

        echo -e "${GREEN}Response from LM Studio:${NC}"
        echo "$RESPONSE" | python3 -c 'import json,sys; r=json.load(sys.stdin); print(r.get("choices",[{}])[0].get("message",{}).get("content","No response"))'
    else
        echo "$JSON_PAYLOAD" > "$OUTPUT_FILE"
        echo -e "${GREEN}JSON payload saved to: $OUTPUT_FILE${NC}"
        echo ""
        echo -e "${YELLOW}To use with LM Studio API:${NC}"
        echo "  curl http://localhost:1234/v1/chat/completions \\"
        echo "    -H 'Content-Type: application/json' \\"
        echo "    -d @$OUTPUT_FILE"
    fi
else
    # Plain text output
    echo "$SYSTEM_PROMPT" > "$OUTPUT_FILE"
    echo -e "${GREEN}System prompt saved to: $OUTPUT_FILE${NC}"
    echo ""
    echo -e "${YELLOW}To use in LM Studio:${NC}"
    echo "1. Open LM Studio"
    echo "2. Load a model"
    echo "3. Click 'System Prompt' in the chat settings"
    echo "4. Paste the contents of: $OUTPUT_FILE"
    echo "5. Start chatting - the model will be in NL-OS mode"
    echo ""
    echo "Or copy to clipboard (macOS):"
    echo "  cat $OUTPUT_FILE | pbcopy"
fi
