#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

function readVersion(goMod, content) {
  const directives = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.replace(/\/\/.*$/, "").trim())
    .filter((line) => /^go(?:\s|$)/.test(line));

  if (directives.length !== 1) {
    throw new Error(
      `Expected one go directive in ${goMod}; found ${directives.length}. Inspect the module file before choosing a target version.`,
    );
  }

  const fields = directives[0].split(/\s+/);
  const version = fields[1] || "";
  const match = version.match(
    /^([1-9]\d*)\.(0|[1-9]\d*)(?:\.(0|[1-9]\d*))?(?:(?:beta|rc)[1-9]\d*)?$/,
  );
  if (fields.length !== 2 || !match) {
    throw new Error(`Cannot read a Go version from ${goMod}: ${directives[0]}`);
  }

  return {
    goMod,
    goVersion: version,
    languageVersion: `${match[1]}.${match[2]}`,
  };
}

function detectVersion(target) {
  const resolved = path.resolve(target);
  const stat = fs.statSync(resolved);
  if (!stat.isDirectory() && !stat.isFile()) {
    throw new Error(`Target must be a file or directory: ${resolved}`);
  }
  let directory = stat.isDirectory() ? resolved : path.dirname(resolved);

  for (;;) {
    const goMod = path.join(directory, "go.mod");
    let content;
    try {
      content = fs.readFileSync(goMod, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }

    // A malformed nearest module must not silently inherit its parent's version.
    if (content !== undefined) return readVersion(goMod, content);

    const parent = path.dirname(directory);
    if (parent === directory) {
      throw new Error(
        `No go.mod found at or above ${resolved}. Pass a path inside the target module or specify the intended compatibility target.`,
      );
    }
    directory = parent;
  }
}

try {
  const args = process.argv.slice(2);
  if (args.length !== 1 || args[0] === "--help" || args[0] === "-h") {
    const usage = "Usage: node detect-go-version.js <target-file-or-directory>";
    if (args.length === 1 && (args[0] === "--help" || args[0] === "-h")) {
      console.log(usage);
    } else {
      throw new Error(usage);
    }
  } else {
    console.log(JSON.stringify(detectVersion(args[0]), null, 2));
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
