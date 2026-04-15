#!/usr/bin/env node

const fs = require("fs");

function parseArgs(argv) {
  const args = {
    input: "-",
    maxChars: 2200,
    softMinChars: 1200,
    format: "json",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "--input":
        args.input = argv[++i];
        break;
      case "--output":
        args.output = argv[++i];
        break;
      case "--max-chars":
        args.maxChars = parsePositiveInt(argv[++i], "--max-chars");
        break;
      case "--soft-min-chars":
        args.softMinChars = parsePositiveInt(argv[++i], "--soft-min-chars");
        break;
      case "--format":
        args.format = argv[++i];
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!["json", "text"].includes(args.format)) {
    throw new Error("--format must be json or text");
  }

  return args;
}

function parsePositiveInt(value, flagName) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${flagName} expects a positive integer`);
  }
  return parsed;
}

function printHelp() {
  console.log(`Usage: node chunk-text.js [options]

Options:
  --input <path|->         Read from a file or stdin
  --output <path>          Write output to a file
  --max-chars <n>          Hard chunk limit, default 2200
  --soft-min-chars <n>     Prefer not to cut below this size, default 1200
  --format <json|text>     Output JSON metadata or plain chunk text
`);
}

function readInput(input) {
  if (input === "-") {
    return fs.readFileSync(0, "utf8");
  }
  return fs.readFileSync(input, "utf8");
}

function protectCodeFences(text) {
  const fences = [];
  const protectedText = text.replace(/```[\s\S]*?```/g, (match) => {
    const token = `@@CODE_FENCE_${fences.length}@@`;
    fences.push(match);
    return token;
  });
  return { protectedText, fences };
}

function restoreCodeFences(text, fences) {
  return text.replace(/@@CODE_FENCE_(\d+)@@/g, (_, index) => fences[Number(index)]);
}

function splitIntoBlocks(text) {
  const blocks = [];
  const regex = /\n{2,}/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const chunk = text.slice(lastIndex, match.index) + match[0];
    if (chunk) {
      blocks.push(chunk);
    }
    lastIndex = match.index + match[0].length;
  }

  const tail = text.slice(lastIndex);
  if (tail) {
    blocks.push(tail);
  }

  return blocks.length > 0 ? blocks : [text];
}

function splitOversizedBlock(block, maxChars) {
  if (block.length <= maxChars) {
    return [block];
  }

  const parts = [];
  let remaining = block;

  while (remaining.length > maxChars) {
    let splitAt = findSentenceBoundary(remaining, maxChars);
    if (splitAt === -1 || splitAt < Math.floor(maxChars * 0.5)) {
      splitAt = maxChars;
    }
    parts.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt);
  }

  if (remaining) {
    parts.push(remaining);
  }

  return parts;
}

function findSentenceBoundary(text, limit) {
  const boundaryRegex = /[.!?。！？]\s+/g;
  let lastBoundary = -1;
  let match;

  while ((match = boundaryRegex.exec(text)) !== null) {
    const boundary = match.index + match[0].length;
    if (boundary > limit) {
      break;
    }
    lastBoundary = boundary;
  }

  return lastBoundary;
}

function chunkText(text, maxChars, softMinChars) {
  const { protectedText, fences } = protectCodeFences(text.replace(/\r\n/g, "\n"));
  const rawBlocks = splitIntoBlocks(protectedText);
  const blocks = rawBlocks.flatMap((block) => splitOversizedBlock(block, maxChars));

  const chunks = [];
  let current = "";

  for (const block of blocks) {
    if (!current) {
      current = block;
      continue;
    }

    const candidate = current + block;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current.length >= softMinChars || block.length > softMinChars) {
      chunks.push(current);
      current = block;
      continue;
    }

    chunks.push(current);
    current = block;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks.map((chunk, index) => ({
    id: `chunk-${String(index + 1).padStart(3, "0")}`,
    text: restoreCodeFences(chunk, fences),
    char_count: restoreCodeFences(chunk, fences).length,
  }));
}

function renderText(chunks) {
  return chunks
    .map((chunk) => `### ${chunk.id}\n${chunk.text}`)
    .join("\n\n");
}

function writeOutput(outputPath, content) {
  if (outputPath) {
    fs.writeFileSync(outputPath, content);
    return;
  }
  process.stdout.write(content);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const input = readInput(args.input);
  const chunks = chunkText(input, args.maxChars, args.softMinChars);

  if (args.format === "text") {
    writeOutput(args.output, `${renderText(chunks)}\n`);
    return;
  }

  const payload = {
    version: 1,
    source_char_count: input.length,
    chunk_count: chunks.length,
    max_chars: args.maxChars,
    soft_min_chars: args.softMinChars,
    chunks,
  };
  writeOutput(args.output, `${JSON.stringify(payload, null, 2)}\n`);
}

main();
