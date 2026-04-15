#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const readline = require("readline");

const DEFAULT_CONFIG = {
  version: 1,
  default_target_language: "zh-CN",
  default_mode: "faithful",
  tone: "neutral",
  preserve_formatting: true,
  glossary: {},
  do_not_translate: [],
};

const MODES = new Set(["literal", "faithful", "localized"]);

function defaultConfigPath() {
  return path.join(os.homedir(), ".codex", "skills", "translate", "config.json");
}

function parseArgs(argv) {
  const args = {
    config: defaultConfigPath(),
    glossary: [],
    doNotTranslate: [],
    show: false,
    ensure: false,
    interactive: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--config":
        args.config = argv[++i];
        break;
      case "--show":
        args.show = true;
        break;
      case "--ensure":
        args.ensure = true;
        break;
      case "--interactive":
        args.interactive = true;
        break;
      case "--default-target-language":
        args.defaultTargetLanguage = argv[++i];
        break;
      case "--default-mode":
        args.defaultMode = argv[++i];
        break;
      case "--tone":
        args.tone = argv[++i];
        break;
      case "--preserve-formatting":
        args.preserveFormatting = parseBoolean(argv[++i], "--preserve-formatting");
        break;
      case "--glossary":
        args.glossary.push(argv[++i]);
        break;
      case "--do-not-translate":
        args.doNotTranslate.push(argv[++i]);
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function parseBoolean(value, flagName) {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  throw new Error(`${flagName} expects true or false`);
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readConfig(filePath) {
  if (!fs.existsSync(filePath)) {
    return { ...DEFAULT_CONFIG };
  }

  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return normalizeConfig(parsed);
}

function normalizeConfig(config) {
  const merged = {
    ...DEFAULT_CONFIG,
    ...config,
    glossary: { ...DEFAULT_CONFIG.glossary, ...(config.glossary || {}) },
    do_not_translate: Array.isArray(config.do_not_translate)
      ? [...config.do_not_translate]
      : [...DEFAULT_CONFIG.do_not_translate],
  };

  if (!MODES.has(merged.default_mode)) {
    throw new Error(`default_mode must be one of: ${Array.from(MODES).join(", ")}`);
  }

  return merged;
}

function mergeArgs(config, args) {
  const next = { ...config };

  if (args.defaultTargetLanguage) {
    next.default_target_language = args.defaultTargetLanguage;
  }
  if (args.defaultMode) {
    if (!MODES.has(args.defaultMode)) {
      throw new Error(`--default-mode must be one of: ${Array.from(MODES).join(", ")}`);
    }
    next.default_mode = args.defaultMode;
  }
  if (args.tone) {
    next.tone = args.tone;
  }
  if (typeof args.preserveFormatting === "boolean") {
    next.preserve_formatting = args.preserveFormatting;
  }

  for (const pair of args.glossary) {
    const index = pair.indexOf("=");
    if (index <= 0) {
      throw new Error(`--glossary expects source=target, got: ${pair}`);
    }
    const source = pair.slice(0, index).trim();
    const target = pair.slice(index + 1).trim();
    if (!source || !target) {
      throw new Error(`--glossary expects source=target, got: ${pair}`);
    }
    next.glossary[source] = target;
  }

  if (args.doNotTranslate.length > 0) {
    const merged = new Set(next.do_not_translate);
    for (const item of args.doNotTranslate) {
      if (item.trim()) {
        merged.add(item.trim());
      }
    }
    next.do_not_translate = Array.from(merged);
  }

  return normalizeConfig(next);
}

function writeConfig(filePath, config) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, `${JSON.stringify(config, null, 2)}\n`);
}

function printHelp() {
  console.log(`Usage: node init-config.js [options]

Options:
  --config <path>                    Override config path
  --show                             Print the resolved config
  --ensure                           Create the config with defaults if missing
  --interactive                      Prompt for values in a TTY
  --default-target-language <lang>   Set default target language
  --default-mode <mode>              Set mode: literal|faithful|localized
  --tone <tone>                      Set preferred tone
  --preserve-formatting <bool>       Set true or false
  --glossary <src=dst>               Add a glossary mapping, repeatable
  --do-not-translate <term>          Add a protected term, repeatable
`);
}

function isInteractiveTerminal() {
  return process.stdin.isTTY && process.stdout.isTTY;
}

function createPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return {
    ask(question) {
      return new Promise((resolve) => {
        rl.question(question, resolve);
      });
    },
    close() {
      rl.close();
    },
  };
}

async function runInteractive(config) {
  const prompt = createPrompt();

  try {
    const language =
      (await prompt.ask(`Default target language [${config.default_target_language}]: `)).trim() ||
      config.default_target_language;
    const mode =
      (await prompt.ask(`Default mode literal|faithful|localized [${config.default_mode}]: `)).trim() ||
      config.default_mode;
    const tone = (await prompt.ask(`Tone [${config.tone}]: `)).trim() || config.tone;
    const preserveInput =
      (await prompt.ask(
        `Preserve formatting true|false [${String(config.preserve_formatting)}]: `,
      )).trim() || String(config.preserve_formatting);
    const glossaryInput = (
      await prompt.ask("Glossary pairs src=dst, comma-separated [leave blank to keep current]: ")
    ).trim();
    const protectedInput = (
      await prompt.ask("Do-not-translate terms, comma-separated [leave blank to keep current]: ")
    ).trim();

    const next = mergeArgs(config, {
      glossary: glossaryInput ? glossaryInput.split(",").map((item) => item.trim()) : [],
      doNotTranslate: protectedInput ? protectedInput.split(",").map((item) => item.trim()) : [],
      defaultTargetLanguage: language,
      defaultMode: mode,
      tone,
      preserveFormatting: parseBoolean(preserveInput, "interactive preserve_formatting"),
    });

    return next;
  } finally {
    prompt.close();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let config = readConfig(args.config);

  if (args.show) {
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  const hasExplicitMutations =
    Boolean(args.defaultTargetLanguage) ||
    Boolean(args.defaultMode) ||
    Boolean(args.tone) ||
    typeof args.preserveFormatting === "boolean" ||
    args.glossary.length > 0 ||
    args.doNotTranslate.length > 0;

  if (args.interactive || (!fs.existsSync(args.config) && !hasExplicitMutations && isInteractiveTerminal())) {
    config = await runInteractive(config);
    writeConfig(args.config, config);
    console.log(`Wrote ${args.config}`);
    return;
  }

  if (hasExplicitMutations) {
    config = mergeArgs(config, args);
    writeConfig(args.config, config);
    console.log(`Wrote ${args.config}`);
    return;
  }

  if (args.ensure) {
    writeConfig(args.config, config);
    console.log(`Wrote ${args.config}`);
    return;
  }

  printHelp();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
