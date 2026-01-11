#!/usr/bin/env python3
"""
generate-kernel-payload.py - Generate portable NL-OS kernel payloads

Creates standalone files that can be fed to ANY LLM as system prompt/context.
The generated payload allows any capable model to "boot" into Capturebox NL-OS mode.

Usage:
    python3 scripts/generate-kernel-payload.py [options]

Options:
    --tier TIER       Payload tier: mandatory, lazy, full (default: mandatory)
    --format FORMAT   Output format: markdown, json, text (default: markdown)
    --output PATH     Output file path (default: portable/kernel-payload.md)
    --all             Generate all tiers and formats
    --verify          Verify all source files exist
    --tokens          Show token estimates only, don't generate

Examples:
    python3 scripts/generate-kernel-payload.py                        # Default payload
    python3 scripts/generate-kernel-payload.py --tier full            # Full kernel
    python3 scripts/generate-kernel-payload.py --format json          # JSON for APIs
    python3 scripts/generate-kernel-payload.py --all                  # All variants
    python3 scripts/generate-kernel-payload.py --verify               # Verify files
"""

import argparse
import json
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional

# Resolve capturebox root
SCRIPT_DIR = Path(__file__).parent
CAPTUREBOX_ROOT = SCRIPT_DIR.parent

# File definitions with token estimates (based on ~4 chars per token)
KERNEL_FILES = {
    'mandatory': [
        ('memory.md', 4600),
        ('AGENTS.md', 1200),
        ('axioms.yaml', 4800),
    ],
    'lazy': [
        ('personalities.md', 3600),
        ('.cursor/commands/COMMAND-MAP.md', 1350),
    ],
    'extended': [
        ('projects/README.md', 1000),
        ('KERNEL.yaml', 500),
    ],
}


def read_file(path: Path) -> str:
    """Read file contents, return placeholder if missing."""
    full_path = CAPTUREBOX_ROOT / path
    if full_path.exists():
        return full_path.read_text()
    return f"# File not found: {path}\n"


def verify_files() -> bool:
    """Verify all kernel files exist."""
    all_exist = True

    print("Verifying kernel files...")
    print()

    for tier_name, files in KERNEL_FILES.items():
        print(f"  {tier_name.upper()} tier:")
        for filename, tokens in files:
            full_path = CAPTUREBOX_ROOT / filename
            exists = full_path.exists()
            status = "[x]" if exists else "[ ]"
            size = f"({full_path.stat().st_size:,} bytes)" if exists else "(MISSING)"
            print(f"    {status} {filename} {size}")
            if not exists and tier_name == 'mandatory':
                all_exist = False
        print()

    return all_exist


def estimate_tokens(tier: str = 'mandatory') -> dict:
    """Calculate token estimates for a tier."""
    files_to_include = KERNEL_FILES['mandatory'].copy()

    if tier in ('lazy', 'full'):
        files_to_include.extend(KERNEL_FILES['lazy'])
    if tier == 'full':
        files_to_include.extend(KERNEL_FILES['extended'])

    total_tokens = sum(tokens for _, tokens in files_to_include)

    return {
        'tier': tier,
        'file_count': len(files_to_include),
        'estimated_tokens': total_tokens,
        'files': [(f, t) for f, t in files_to_include],
    }


def generate_payload(tier: str = 'mandatory', format: str = 'markdown') -> str:
    """Generate kernel payload for specified tier and format."""

    files_to_load = KERNEL_FILES['mandatory'].copy()
    if tier in ('lazy', 'full'):
        files_to_load.extend(KERNEL_FILES['lazy'])
    if tier == 'full':
        files_to_load.extend(KERNEL_FILES['extended'])

    # Load file contents
    sections = []
    total_tokens = 0

    for filename, tokens in files_to_load:
        content = read_file(Path(filename))
        actual_tokens = len(content) // 4  # Rough estimate
        sections.append({
            'file': filename,
            'content': content,
            'estimated_tokens': tokens,
            'actual_chars': len(content),
        })
        total_tokens += actual_tokens

    # Format output
    if format == 'json':
        return json.dumps({
            'metadata': {
                'generated': datetime.now().isoformat(),
                'generator': 'generate-kernel-payload.py',
                'tier': tier,
                'total_estimated_tokens': total_tokens,
                'file_count': len(sections),
            },
            'instructions': (
                "Feed this payload to any LLM as system prompt or context. "
                "The model will boot into Capturebox NL-OS mode. "
                "After loading, the model should acknowledge: "
                "'Kernel loaded. Ready for capturebox operations.'"
            ),
            'files': [
                {
                    'filename': s['file'],
                    'content': s['content'],
                }
                for s in sections
            ],
        }, indent=2, ensure_ascii=False)

    elif format == 'text':
        # Plain concatenation for simple use
        return '\n\n'.join([s['content'] for s in sections])

    else:  # markdown (default)
        header = f"""# Capturebox NL-OS Kernel Payload

**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M')}
**Tier**: {tier}
**Estimated tokens**: ~{total_tokens:,}
**Files**: {len(sections)}

---

## How to Use This Payload

Feed this entire file as system prompt or context to any capable LLM.
The LLM will "boot" into Capturebox NL-OS mode.

### Supported Runtimes:
- Claude Code / Claude API
- Cursor IDE
- Ollama (any model)
- llama.cpp
- LM Studio
- OpenAI-compatible APIs
- Any LLM with system prompt capability

### After Loading

The model should acknowledge: **"Kernel loaded. Ready for capturebox operations."**

### Quick Start

**Ollama:**
```bash
ollama run qwen2.5:3b --system "$(cat portable/kernel-payload.md)"
```

**LM Studio:**
1. Open LM Studio
2. Paste this file's contents into System Prompt
3. Start chatting

**API (OpenAI-compatible):**
```python
messages = [
    {{"role": "system", "content": open("portable/kernel-payload.md").read()}},
    {{"role": "user", "content": "Acknowledge kernel boot."}}
]
```

---

# KERNEL CONTEXT BEGINS

"""

        body_parts = []
        for s in sections:
            body_parts.append(f"""---

## {s['file']}

{s['content']}
""")

        footer = """
---

# KERNEL CONTEXT ENDS

After reading the above kernel context, acknowledge with:
"Kernel loaded. Ready for capturebox operations."
"""

        return header + '\n'.join(body_parts) + footer


def main():
    parser = argparse.ArgumentParser(
        description='Generate portable NL-OS kernel payloads',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--tier',
        choices=['mandatory', 'lazy', 'full'],
        default='mandatory',
        help='Payload tier (default: mandatory)'
    )
    parser.add_argument(
        '--format',
        choices=['markdown', 'json', 'text'],
        default='markdown',
        help='Output format (default: markdown)'
    )
    parser.add_argument(
        '--output',
        type=Path,
        help='Output file path (default: portable/kernel-payload.md)'
    )
    parser.add_argument(
        '--all',
        action='store_true',
        help='Generate all tiers and formats'
    )
    parser.add_argument(
        '--verify',
        action='store_true',
        help='Verify all source files exist'
    )
    parser.add_argument(
        '--tokens',
        action='store_true',
        help='Show token estimates only'
    )

    args = parser.parse_args()

    # Verify mode
    if args.verify:
        success = verify_files()
        sys.exit(0 if success else 1)

    # Token estimate mode
    if args.tokens:
        for tier in ['mandatory', 'lazy', 'full']:
            info = estimate_tokens(tier)
            print(f"\n{tier.upper()} tier: ~{info['estimated_tokens']:,} tokens")
            for filename, tokens in info['files']:
                print(f"  - {filename}: ~{tokens:,}")
        sys.exit(0)

    # Ensure output directory exists
    output_dir = CAPTUREBOX_ROOT / 'portable'
    output_dir.mkdir(parents=True, exist_ok=True)

    # Generate all mode
    if args.all:
        generated = []

        # Generate all combinations
        for tier in ['mandatory', 'full']:
            for fmt in ['markdown', 'json']:
                suffix = '' if tier == 'mandatory' else f'-{tier}'
                ext = 'md' if fmt == 'markdown' else fmt
                output_path = output_dir / f'kernel-payload{suffix}.{ext}'

                payload = generate_payload(tier=tier, format=fmt)
                output_path.write_text(payload)

                info = estimate_tokens(tier)
                generated.append({
                    'file': output_path.name,
                    'tier': tier,
                    'format': fmt,
                    'tokens': info['estimated_tokens'],
                })
                print(f"Generated: {output_path}")

        print(f"\nGenerated {len(generated)} payload files in {output_dir}/")
        return

    # Single file generation
    if args.output:
        output_path = args.output
    else:
        suffix = '' if args.tier == 'mandatory' else f'-{args.tier}'
        ext = 'md' if args.format == 'markdown' else args.format
        output_path = output_dir / f'kernel-payload{suffix}.{ext}'

    # Generate payload
    payload = generate_payload(tier=args.tier, format=args.format)

    # Write output
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(payload)

    info = estimate_tokens(args.tier)
    print(f"Generated {args.tier} kernel payload: {output_path}")
    print(f"Estimated tokens: ~{info['estimated_tokens']:,}")


if __name__ == '__main__':
    main()
