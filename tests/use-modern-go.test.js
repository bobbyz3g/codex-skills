const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");

const detector = path.resolve(
  __dirname,
  "../skills/use-modern-go/scripts/detect-go-version.js",
);

function fixture(t) {
  const tempParent = path.resolve(os.tmpdir());
  const root = fs.mkdtempSync(path.join(tempParent, "use-modern-go-"));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), tempParent);
    assert.ok(path.basename(root).startsWith("use-modern-go-"));
    fs.rmSync(root, { recursive: true, force: true });
  });
  return root;
}

function write(root, relative, content) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
  return file;
}

function run(args, cwd = path.dirname(detector)) {
  // Absolute Node path and an empty PATH prove no Go or Unix tools are required.
  const result = spawnSync(process.execPath, [detector, ...args], {
    cwd,
    env: { ...process.env, PATH: "", GOTOOLCHAIN: "go1.999.0" },
    encoding: "utf8",
    timeout: 5000,
  });
  assert.ifError(result.error);
  return result;
}

test("reads a Windows-style module from a literal Unicode path without Go", (t) => {
  const root = fixture(t);
  const goMod = write(
    root,
    "项目 [demo] with spaces/go.mod",
    "\uFEFFmodule example.com/demo\r\n\r\n\tgo\t1.24.3\t// compatibility\r\ntoolchain go1.27.0\r\n",
  );
  const file = write(root, "项目 [demo] with spaces/cmd/app/main.go", "package main\n");
  const result = run([file]);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    goMod,
    goVersion: "1.24.3",
    languageVersion: "1.24",
  });
  assert.ok(fs.readFileSync(goMod, "utf8").startsWith("\uFEFF"));
});

test("uses the target's nearest module rather than the working directory or workspace", (t) => {
  const root = fixture(t);
  write(root, "go.mod", "module example.com/root\ngo 1.21\n");
  write(root, "go.work", "go 1.27.0\nuse ./nested\n");
  const nested = write(root, "nested/go.mod", "module example.com/nested\ngo 1.23.4\n");
  fs.mkdirSync(path.join(root, "nested/pkg"));
  const result = run(["nested/pkg"], root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).goMod, nested);
  assert.equal(JSON.parse(result.stdout).goVersion, "1.23.4");
});

for (const version of ["1.9", "1.22.0", "1.27rc1", "1.27beta2"]) {
  test(`reads the full declared version ${version} from an explicit go.mod`, (t) => {
    const root = fixture(t);
    const goMod = write(root, "go.mod", `module example.com/test\n// go 1.99\ngo ${version}\n`);
    const result = run([goMod]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).goVersion, version);
  });
}

for (const declaration of ["", "go 1.24.0oops\n", "go 1.21\ngo 1.24\n"]) {
  test(`does not fall back to a parent or toolchain when the nearest declaration is unusable: ${JSON.stringify(declaration)}`, (t) => {
    const root = fixture(t);
    write(root, "go.mod", "module example.com/root\ngo 1.27.0\n");
    const goMod = write(root, "nested/go.mod", `module example.com/nested\n${declaration}toolchain go1.27.0\n`);
    const result = run([path.dirname(goMod)]);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
    assert.ok(result.stderr.includes(goMod));
  });
}

test("reports a missing module instead of treating installed Go as the target", (t) => {
  const root = fixture(t);
  const result = run([root]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /No go\.mod found/);
  assert.equal(result.stdout, "");
});

test("reports an invalid target path rather than using the caller's module", (t) => {
  const root = fixture(t);
  write(root, "go.mod", "module example.com/root\ngo 1.21\n");
  const result = run([path.join(root, "missing.go")], root);
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /ENOENT/);
});

test("requires an explicit target instead of probing the skill directory", () => {
  const result = run([]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage:/);
});
