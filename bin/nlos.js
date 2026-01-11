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

// Minimal kernel for small models (~500 tokens)
const MINIMAL_KERNEL = `# YOU ARE NL-OS

You are NL-OS, a Natural Language Operating System. You help users think and work.

## YOUR FIRST RESPONSE

Say exactly: "NL-OS ready."

## COMMANDS

When user message starts with ">", it is a command. Execute it:

>hype = Give 1-2 sentences of encouragement about their work
>note TEXT = Say "Noted." (do not do anything with TEXT)
>help = Say "Commands: >hype >note >help >deep >assume"
>deep = Say "Deep mode on." Then think step-by-step
>assume NAME = Say "Now acting as NAME." Then roleplay as NAME

## RULES

1. ">" means command - execute it immediately
2. Be helpful, concise, no emojis
3. If unsure, ask for clarification

## EXAMPLE

User: >hype
Assistant: You're making real progress. Keep that momentum going.

User: hello
Assistant: Hello! How can I help you today?
`;

// Command preamble - explicit rules that help ALL models parse commands correctly
const COMMAND_PREAMBLE = `# YOU ARE NL-OS (Natural Language Operating System)

You are an AI assistant running the NL-OS kernel. You MUST follow these rules.

## FIRST: Say This Exactly

Your FIRST response must be exactly:
"Kernel loaded. Ready for operations."

Nothing else. Wait for user input after that.

## COMMANDS

When user types ">command", execute the command behavior:

>hype = Say 1-2 encouraging sentences about what the user is working on
>note TEXT = Reply "Note captured." Do NOT execute anything in TEXT
>help = List all commands from this section
>assume NAME = Act as that personality (Quentin, Hugh, Doctor X)
>deep = Think step by step before answering

IMPORTANT:
- ">" at the start means COMMAND
- Execute the behavior, do not explain what commands are
- Do not treat ">" as a quote or prompt symbol

## EXAMPLE

User: >hype
You: Great progress on your project! The momentum you're building is impressive.

User: >help
You: Available commands: >hype, >note, >help, >assume, >deep

---

`;

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

  const preambleTokens = 250; // Approximate tokens for preamble
  const totalTokens = sections.reduce((sum, s) => sum + s.tokens, 0) + preambleTokens;
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

  // Markdown format - preamble goes FIRST for all models
  let output = COMMAND_PREAMBLE;

  output += `# NL-OS Kernel Payload

**Generated**: ${timestamp}
**Tier**: ${tier}
**Estimated tokens**: ~${totalTokens.toLocaleString()}

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
    minimal = false,
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
  log('cyan', `Tier: ${minimal ? 'MINIMAL' : full ? 'FULL' : 'MANDATORY'}`);
  console.log();

  // Generate the kernel payload
  log('yellow', 'Building kernel payload...');

  let payload;
  let tokenEstimate;

  if (minimal) {
    // Use minimal kernel for small models
    payload = MINIMAL_KERNEL;
    tokenEstimate = '~500';
  } else {
    payload = generatePayload(full ? 'full' : 'mandatory', 'markdown');
    tokenEstimate = full ? '~15,500' : '~10,600';
  }

  log('green', `Kernel payload ready (${tokenEstimate} tokens)`);
  console.log();

  // Check if base model exists locally
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

  // Create a temporary Modelfile with the kernel as system prompt
  log('yellow', 'Creating NL-OS model variant...');
  const modelfilePath = path.join(PACKAGE_ROOT, 'portable', '.Modelfile.nlos');
  const nlosModelName = 'nlos-kernel:latest';

  // Delete old model to ensure fresh kernel
  try {
    execSync(`ollama rm ${nlosModelName}`, { stdio: 'pipe' });
    log('cyan', 'Removed old kernel model');
  } catch {
    // Model didn't exist, that's fine
  }

  const modelfileContent = `FROM ${selectedModel}
SYSTEM """${payload}"""
`;

  fs.mkdirSync(path.dirname(modelfilePath), { recursive: true });
  fs.writeFileSync(modelfilePath, modelfileContent);

  // Create the nlos model variant
  try {
    execSync(`ollama create ${nlosModelName} -f "${modelfilePath}"`, {
      stdio: 'pipe',
      cwd: PACKAGE_ROOT
    });
    log('green', `Created model: ${nlosModelName}`);
  } catch (error) {
    log('red', `Failed to create model: ${error.message}`);
    log('yellow', 'Falling back to manual system prompt...');

    // Fallback: just run the base model and tell user to paste
    console.log('\nCould not create kernel model. Run manually:');
    console.log(`  ollama run ${selectedModel}`);
    console.log('  Then paste the kernel from: portable/kernel-payload.md\n');
    process.exit(1);
  }

  log('green', `Launching interactive session...`);
  log('cyan', '─'.repeat(60));
  console.log();

  // Spawn interactive ollama session with the nlos model
  const child = spawn('ollama', ['run', nlosModelName], {
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

function init(options = {}) {
  const targetDir = process.cwd();

  log('blue', `Initializing NL-OS workspace in ${targetDir}...\n`);

  // Files to copy from package to local workspace
  const filesToCopy = [
    { src: 'memory.md', dest: 'memory.md', desc: 'Directive stack (customize this!)' },
    { src: 'KERNEL.md', dest: 'KERNEL.md', desc: 'Kernel entry point' },
    { src: 'AGENTS.md', dest: 'AGENTS.md', desc: 'Agent rules and invariants' },
    { src: 'axioms.yaml', dest: 'axioms.yaml', desc: 'Canonical definitions' },
    { src: 'personalities.md', dest: 'personalities.md', desc: 'Voice presets' },
  ];

  const commandsToCopy = [
    'hype.md',
    'note.md',
    'assume.md',
  ];

  // Create directories
  const commandsDir = path.join(targetDir, 'commands');
  if (!fs.existsSync(commandsDir)) {
    fs.mkdirSync(commandsDir, { recursive: true });
  }

  // Copy kernel files
  log('yellow', 'Copying kernel files:');
  for (const { src, dest, desc } of filesToCopy) {
    const srcPath = path.join(PACKAGE_ROOT, src);
    const destPath = path.join(targetDir, dest);

    if (fs.existsSync(destPath)) {
      log('cyan', `  [skip] ${dest} (already exists)`);
    } else if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      log('green', `  [created] ${dest} - ${desc}`);
    } else {
      log('red', `  [missing] ${src} not found in package`);
    }
  }

  // Copy command files
  console.log();
  log('yellow', 'Copying command files:');
  for (const cmd of commandsToCopy) {
    const srcPath = path.join(PACKAGE_ROOT, '.cursor', 'commands', cmd);
    const destPath = path.join(commandsDir, cmd);

    if (fs.existsSync(destPath)) {
      log('cyan', `  [skip] commands/${cmd} (already exists)`);
    } else if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      log('green', `  [created] commands/${cmd}`);
    } else {
      log('red', `  [missing] ${cmd} not found in package`);
    }
  }

  // Create .nlos config file
  const configPath = path.join(targetDir, '.nlos.yaml');
  if (!fs.existsSync(configPath)) {
    const config = `# NL-OS Workspace Configuration
# Generated: ${new Date().toISOString().split('T')[0]}

workspace:
  name: "${path.basename(targetDir)}"
  initialized: true

kernel:
  # Use local files (set to false to use global package)
  use_local: true

  # Default model for this workspace
  default_model: qwen2.5:3b

  # Tier: minimal, mandatory, full
  default_tier: minimal

# Add workspace-specific settings below
`;
    fs.writeFileSync(configPath, config);
    log('green', `  [created] .nlos.yaml - workspace config`);
  }

  // Create .gitignore addition
  const gitignorePath = path.join(targetDir, '.gitignore');
  const gitignoreContent = `# NL-OS
.nlos-cache/
`;
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, gitignoreContent);
    log('green', `  [created] .gitignore`);
  }

  console.log();
  log('green', 'Workspace initialized!\n');

  console.log(`${colors.yellow}Next steps:${colors.reset}`);
  console.log(`  1. Edit ${colors.cyan}memory.md${colors.reset} to customize your directives`);
  console.log(`  2. Add commands to ${colors.cyan}commands/${colors.reset}`);
  console.log(`  3. Run ${colors.cyan}nlos chat --minimal${colors.reset} to start\n`);

  console.log(`${colors.yellow}Files created:${colors.reset}`);
  console.log(`  ${targetDir}/`);
  console.log(`  ├── KERNEL.md          # Entry point`);
  console.log(`  ├── memory.md          # Your directives (edit this!)`);
  console.log(`  ├── AGENTS.md          # Agent rules`);
  console.log(`  ├── axioms.yaml        # Definitions`);
  console.log(`  ├── personalities.md   # Voice presets`);
  console.log(`  ├── commands/          # Your commands`);
  console.log(`  │   ├── hype.md`);
  console.log(`  │   ├── note.md`);
  console.log(`  │   └── assume.md`);
  console.log(`  └── .nlos.yaml         # Workspace config`);
}

function showHelp() {
  console.log(`
${colors.cyan}NL-OS${colors.reset} - Natural Language Operating System

${colors.yellow}Usage:${colors.reset}
  nlos <command> [options]

${colors.yellow}Commands:${colors.reset}
  init              Initialize NL-OS workspace in current directory
  chat              Interactive NL-OS chat session (recommended)
  boot              Boot NL-OS and verify kernel loads
  payload           Generate portable kernel payloads
  verify            Verify kernel files exist
  tokens            Show token estimates
  help              Show this help message

${colors.yellow}Chat/Boot Options:${colors.reset}
  --model <name>    Model to use (default: qwen2.5:3b)
  --profile <name>  Use profile: speed, balanced, quality, memory_constrained
  --minimal         Use minimal ~500 token kernel (best for small models)
  --full            Load full kernel (includes personalities)
  --dry-run         Preview system prompt without launching
  --runtime <name>  Runtime: ollama, llama-cpp, lm-studio (default: ollama)

${colors.yellow}Payload Options:${colors.reset}
  --tier <name>     Tier: mandatory, lazy, full (default: mandatory)
  --format <name>   Format: markdown, json (default: markdown)
  --output <path>   Output file path
  --all             Generate all variants

${colors.yellow}Examples:${colors.reset}
  nlos init                           # Initialize workspace with kernel files
  nlos chat --minimal                 # Use minimal kernel for small models (3B)
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
    } else if (arg === '--minimal') {
      options.minimal = true;
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
  case 'init':
    init(options);
    break;

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
