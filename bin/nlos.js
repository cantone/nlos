#!/usr/bin/env node

/**
 * NL-OS CLI - Natural Language Operating System
 *
 * A model-agnostic kernel that turns any LLM into a cognitive operating system.
 *
 * Usage:
 *   nlos chat [options]     Interactive NL-OS chat session (recommended)
 *   nlos boot [options]     Boot NL-OS and verify kernel loads
 *   nlos payload [options]  Generate portable kernel payloads
 *   nlos verify             Verify kernel files exist
 *   nlos tokens             Show token estimates
 *   nlos help               Show this help message
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Resolve package root (handles both npm install and local dev)
const PACKAGE_ROOT = path.resolve(__dirname, '..');

// Kernel file definitions with token estimates
const KERNEL_FILES = {
  mandatory: [
    { file: 'memory.md', tokens: 4600 },
    { file: 'AGENTS.md', tokens: 1200 },
    { file: 'axioms.yaml', tokens: 4800 },
  ],
  lazy: [
    { file: 'personalities.md', tokens: 3600 },
    { file: '.cursor/commands/COMMAND-MAP.md', tokens: 1350 },
  ],
  extended: [
    { file: 'projects/README.md', tokens: 1000 },
    { file: 'KERNEL.yaml', tokens: 500 },
  ],
};

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(PACKAGE_ROOT, relativePath));
}

function readFile(relativePath) {
  const fullPath = path.join(PACKAGE_ROOT, relativePath);
  if (fs.existsSync(fullPath)) {
    return fs.readFileSync(fullPath, 'utf-8');
  }
  return `# File not found: ${relativePath}\n`;
}

function verifyFiles() {
  log('blue', 'Verifying kernel files...\n');

  let allExist = true;

  for (const [tier, files] of Object.entries(KERNEL_FILES)) {
    console.log(`  ${tier.toUpperCase()} tier:`);
    for (const { file, tokens } of files) {
      const exists = fileExists(file);
      const status = exists ? '[x]' : '[ ]';
      const color = exists ? 'green' : 'red';

      if (exists) {
        const stats = fs.statSync(path.join(PACKAGE_ROOT, file));
        log(color, `    ${status} ${file} (${stats.size.toLocaleString()} bytes)`);
      } else {
        log(color, `    ${status} ${file} (MISSING)`);
        if (tier === 'mandatory') allExist = false;
      }
    }
    console.log();
  }

  return allExist;
}

function showTokens() {
  log('blue', 'Token estimates by tier:\n');

  for (const tier of ['mandatory', 'lazy', 'extended']) {
    let files = [...KERNEL_FILES.mandatory];
    if (tier === 'lazy' || tier === 'extended') {
      files = [...files, ...KERNEL_FILES.lazy];
    }
    if (tier === 'extended') {
      files = [...files, ...KERNEL_FILES.extended];
    }

    const total = files.reduce((sum, f) => sum + f.tokens, 0);
    log('cyan', `${tier.toUpperCase()} tier: ~${total.toLocaleString()} tokens`);

    for (const { file, tokens } of files) {
      console.log(`  - ${file}: ~${tokens.toLocaleString()}`);
    }
    console.log();
  }
}

function generatePayload(tier = 'mandatory', format = 'markdown') {
  let files = [...KERNEL_FILES.mandatory];
  if (tier === 'lazy' || tier === 'full') {
    files = [...files, ...KERNEL_FILES.lazy];
  }
  if (tier === 'full') {
    files = [...files, ...KERNEL_FILES.extended];
  }

  const sections = files.map(({ file, tokens }) => ({
    file,
    content: readFile(file),
    tokens,
  }));

  const totalTokens = sections.reduce((sum, s) => sum + s.tokens, 0);
  const timestamp = new Date().toISOString().split('T')[0];

  if (format === 'json') {
    return JSON.stringify({
      metadata: {
        generated: new Date().toISOString(),
        generator: 'nlos',
        tier,
        total_estimated_tokens: totalTokens,
      },
      files: sections.map(s => ({ filename: s.file, content: s.content })),
    }, null, 2);
  }

  // Markdown format
  let output = `# NL-OS Kernel Payload

**Generated**: ${timestamp}
**Tier**: ${tier}
**Estimated tokens**: ~${totalTokens.toLocaleString()}

---

## How to Use

Paste this entire file as system prompt or context to any LLM.
After loading, the model should acknowledge: "Kernel loaded. Ready for capturebox operations."

---

`;

  for (const s of sections) {
    output += `\n## ${s.file}\n\n${s.content}\n\n---\n`;
  }

  return output;
}

function boot(options = {}) {
  const {
    model = 'qwen2.5:3b',
    full = false,
    dryRun = false,
    profile = null,
    runtime = 'ollama',
  } = options;

  // Resolve model based on profile
  let selectedModel = model;
  if (profile) {
    const profiles = {
      speed: 'qwen2.5:3b',
      balanced: 'mistral:7b',
      quality: 'llama3.1:8b',
      memory_constrained: 'qwen2.5:3b',
    };
    selectedModel = profiles[profile] || model;
  }

  log('blue', `Booting NL-OS via ${runtime}...`);
  log('cyan', `Model: ${selectedModel}`);
  log('cyan', `Tier: ${full ? 'FULL' : 'MANDATORY'}`);
  console.log();

  // Check for Python script first (more features)
  const scriptPath = path.join(PACKAGE_ROOT, 'scripts', `kernel-boot-${runtime}.sh`);

  if (fs.existsSync(scriptPath)) {
    const args = [];
    if (selectedModel !== 'qwen2.5:3b') args.push('--model', selectedModel);
    if (full) args.push('--full');
    if (dryRun) args.push('--dry-run');

    if (dryRun) {
      // For dry-run, capture and display output
      try {
        const output = execSync(`${scriptPath} ${args.join(' ')}`, {
          encoding: 'utf-8',
          cwd: PACKAGE_ROOT,
        });
        console.log(output);
      } catch (error) {
        log('red', `Error: ${error.message}`);
        process.exit(1);
      }
    } else {
      // For interactive, spawn with stdio inheritance
      const child = spawn(scriptPath, args, {
        cwd: PACKAGE_ROOT,
        stdio: 'inherit',
      });

      child.on('error', (error) => {
        log('red', `Error: ${error.message}`);
        process.exit(1);
      });

      child.on('exit', (code) => {
        process.exit(code || 0);
      });
    }
  } else {
    // Fallback: generate payload and show instructions
    log('yellow', `Boot script not found for ${runtime}.`);
    log('yellow', 'Generating payload instead...\n');

    const payload = generatePayload(full ? 'full' : 'mandatory', 'markdown');
    const outputPath = path.join(PACKAGE_ROOT, 'portable', 'kernel-payload-temp.md');

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, payload);

    log('green', `Payload saved to: ${outputPath}`);
    console.log('\nTo boot manually:');
    console.log(`  cat ${outputPath} | pbcopy  # Copy to clipboard`);
    console.log('  # Paste into your LLM chat');
  }
}

function chat(options = {}) {
  const {
    model = 'qwen2.5:3b',
    full = false,
    profile = null,
  } = options;

  // Resolve model based on profile
  let selectedModel = model;
  if (profile) {
    const profiles = {
      speed: 'qwen2.5:3b',
      balanced: 'mistral:7b',
      quality: 'llama3.1:8b',
      memory_constrained: 'qwen2.5:3b',
    };
    selectedModel = profiles[profile] || model;
  }

  log('blue', `Starting NL-OS chat session...`);
  log('cyan', `Model: ${selectedModel}`);
  log('cyan', `Tier: ${full ? 'FULL' : 'MANDATORY'}`);
  console.log();

  // Generate the kernel payload
  log('yellow', 'Building kernel payload...');
  const payload = generatePayload(full ? 'full' : 'mandatory', 'markdown');

  // Write to temp file (ollama --system has length limits, file is safer)
  const tempPayloadPath = path.join(PACKAGE_ROOT, 'portable', '.kernel-payload-session.md');
  fs.mkdirSync(path.dirname(tempPayloadPath), { recursive: true });
  fs.writeFileSync(tempPayloadPath, payload);

  const tokenEstimate = full ? '~15,500' : '~10,600';
  log('green', `Kernel payload ready (${tokenEstimate} tokens)`);
  console.log();

  // Check if model exists locally
  try {
    execSync(`ollama list | grep -q "${selectedModel.split(':')[0]}"`, { stdio: 'pipe' });
  } catch {
    log('yellow', `Model ${selectedModel} not found locally. Pulling...`);
    try {
      execSync(`ollama pull ${selectedModel}`, { stdio: 'inherit' });
    } catch (error) {
      log('red', `Failed to pull model: ${error.message}`);
      process.exit(1);
    }
  }

  log('green', `Launching interactive session with ${selectedModel}...`);
  log('cyan', '─'.repeat(60));
  console.log();

  // Spawn interactive ollama session with system prompt from file
  const child = spawn('ollama', ['run', selectedModel, '--system', payload], {
    stdio: 'inherit',
  });

  child.on('error', (error) => {
    log('red', `Error: ${error.message}`);
    log('yellow', 'Make sure Ollama is installed and running: https://ollama.ai');
    process.exit(1);
  });

  child.on('exit', (code) => {
    console.log();
    log('cyan', '─'.repeat(60));
    log('blue', 'NL-OS session ended.');
    process.exit(code || 0);
  });
}

function payload(options = {}) {
  const {
    tier = 'mandatory',
    format = 'markdown',
    output = null,
    all = false,
  } = options;

  const portableDir = path.join(PACKAGE_ROOT, 'portable');
  fs.mkdirSync(portableDir, { recursive: true });

  if (all) {
    const variants = [
      { tier: 'mandatory', format: 'markdown', name: 'kernel-payload.md' },
      { tier: 'mandatory', format: 'json', name: 'kernel-payload.json' },
      { tier: 'full', format: 'markdown', name: 'kernel-payload-full.md' },
      { tier: 'full', format: 'json', name: 'kernel-payload-full.json' },
    ];

    for (const v of variants) {
      const content = generatePayload(v.tier, v.format);
      const outputPath = path.join(portableDir, v.name);
      fs.writeFileSync(outputPath, content);
      log('green', `Generated: ${outputPath}`);
    }

    console.log(`\nGenerated ${variants.length} payload files in ${portableDir}/`);
  } else {
    const content = generatePayload(tier, format);

    if (output) {
      fs.writeFileSync(output, content);
      log('green', `Payload saved to: ${output}`);
    } else {
      const ext = format === 'json' ? 'json' : 'md';
      const suffix = tier === 'mandatory' ? '' : `-${tier}`;
      const outputPath = path.join(portableDir, `kernel-payload${suffix}.${ext}`);
      fs.writeFileSync(outputPath, content);
      log('green', `Payload saved to: ${outputPath}`);
    }
  }
}

function showHelp() {
  console.log(`
${colors.cyan}NL-OS${colors.reset} - Natural Language Operating System

${colors.yellow}Usage:${colors.reset}
  nlos <command> [options]

${colors.yellow}Commands:${colors.reset}
  chat              Interactive NL-OS chat session (recommended)
  boot              Boot NL-OS and verify kernel loads
  payload           Generate portable kernel payloads
  verify            Verify kernel files exist
  tokens            Show token estimates
  help              Show this help message

${colors.yellow}Boot Options:${colors.reset}
  --model <name>    Model to use (default: qwen2.5:3b)
  --profile <name>  Use profile: speed, balanced, quality, memory_constrained
  --full            Load full kernel (includes personalities)
  --dry-run         Preview system prompt without launching
  --runtime <name>  Runtime: ollama, llama-cpp, lm-studio (default: ollama)

${colors.yellow}Payload Options:${colors.reset}
  --tier <name>     Tier: mandatory, lazy, full (default: mandatory)
  --format <name>   Format: markdown, json (default: markdown)
  --output <path>   Output file path
  --all             Generate all variants

${colors.yellow}Examples:${colors.reset}
  nlos chat                           # Start interactive chat (recommended)
  nlos chat --model llama3.1:8b       # Chat with specific model
  nlos chat --profile quality --full  # Quality mode with full kernel
  nlos boot                           # Verify kernel loads (one-shot)
  nlos boot --dry-run                 # Preview system prompt
  nlos payload                        # Generate default payload
  nlos payload --all                  # Generate all payloads
  nlos verify                         # Check kernel files
  nlos tokens                         # Show token counts

${colors.yellow}More Info:${colors.reset}
  Repository: https://github.com/yourusername/capturebox
  Quick Start: ${PACKAGE_ROOT}/QUICKSTART.md
`);
}

function parseArgs(args) {
  const options = {};
  let i = 0;

  while (i < args.length) {
    const arg = args[i];

    if (arg === '--model' && args[i + 1]) {
      options.model = args[++i];
    } else if (arg === '--profile' && args[i + 1]) {
      options.profile = args[++i];
    } else if (arg === '--tier' && args[i + 1]) {
      options.tier = args[++i];
    } else if (arg === '--format' && args[i + 1]) {
      options.format = args[++i];
    } else if (arg === '--output' && args[i + 1]) {
      options.output = args[++i];
    } else if (arg === '--runtime' && args[i + 1]) {
      options.runtime = args[++i];
    } else if (arg === '--full') {
      options.full = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--all') {
      options.all = true;
    }

    i++;
  }

  return options;
}

// Main
const args = process.argv.slice(2);
const command = args[0];
const options = parseArgs(args.slice(1));

switch (command) {
  case 'chat':
    chat(options);
    break;

  case 'boot':
    boot(options);
    break;

  case 'payload':
    payload(options);
    break;

  case 'verify':
    const allExist = verifyFiles();
    process.exit(allExist ? 0 : 1);
    break;

  case 'tokens':
    showTokens();
    break;

  case 'help':
  case '--help':
  case '-h':
  case undefined:
    showHelp();
    break;

  default:
    log('red', `Unknown command: ${command}`);
    console.log('Run "nlos help" for usage information.');
    process.exit(1);
}
