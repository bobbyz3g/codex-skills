#!/usr/bin/env node

const fs = require("fs");

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--input":
        args.input = argv[++i];
        break;
      case "--output":
        args.output = argv[++i];
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!args.input) {
    throw new Error("--input is required");
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node merge-output.js --input <translated-chunks.json> [--output <path>]`);
}

function readPayload(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function extractTranslatedChunks(payload) {
  const list = Array.isArray(payload) ? payload : payload.chunks;
  if (!Array.isArray(list)) {
    throw new Error("Input JSON must be an array or an object with a chunks array");
  }

  return list.map((item, index) => {
    if (typeof item === "string") {
      return { id: index + 1, text: item };
    }

    if (item && typeof item === "object") {
      const text = item.translation ?? item.translated_text ?? item.text;
      if (typeof text !== "string") {
        throw new Error("Chunk objects must contain translation, translated_text, or text");
      }
      return { id: item.id ?? index + 1, text };
    }

    throw new Error("Unsupported chunk payload");
  });
}

function cleanup(text) {
  const dedupedLines = [];
  let lastMeaningfulLine = "";

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    const isHeading = /^#{1,6}\s+/.test(trimmed);
    if (isHeading && trimmed === lastMeaningfulLine) {
      while (dedupedLines.length > 0 && dedupedLines[dedupedLines.length - 1] === "") {
        dedupedLines.pop();
      }
      continue;
    }

    dedupedLines.push(line);

    if (trimmed) {
      lastMeaningfulLine = trimmed;
    }
  }

  return dedupedLines.join("\n").replace(/\n{3,}/g, "\n\n");
}

function writeOutput(pathname, content) {
  if (pathname) {
    fs.writeFileSync(pathname, content);
    return;
  }
  process.stdout.write(content);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const payload = readPayload(args.input);
  const chunks = extractTranslatedChunks(payload);
  const merged = cleanup(chunks.map((chunk) => chunk.text).join(""));
  writeOutput(args.output, `${merged}\n`);
}

main();
