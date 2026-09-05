---
name: use-modern-go
description: Apply modern Go syntax and standard library APIs that are valid for the active repository's target Go version. Use when writing, refactoring, or reviewing Go code and the user wants modern Go style without relying on features newer than the module version.
---

# Use Modern Go

Use this skill when the task involves writing, refactoring, or reviewing Go code and modern language or standard-library features may matter.

## Version Selection

Read the `go` directive from the module containing the target code before editing. Start from the file or directory being changed, not the installed skill directory or an unrelated shell working directory. For a repository-wide task, use the root module when it covers the target files; resolve nested modules separately when their versions differ.

Use [scripts/detect-go-version.js](scripts/detect-go-version.js) with an explicit existing target file or directory. The helper uses Node.js built-ins to walk upward to the nearest `go.mod` and read it directly. It does not invoke Go, download toolchains, or require Unix utilities.

```text
node "<skill-directory>/scripts/detect-go-version.js" "<target-file-or-directory>"
```

Resolve both placeholders to real paths before running. Quote paths, especially on Windows where they may contain spaces or non-ASCII characters. In PowerShell, use `&` when invoking a quoted absolute path to the Node executable. Success returns JSON with `goMod`, `goVersion`, and `languageVersion`; failure returns a nonzero exit code and a diagnostic on stderr.

The helper accepts LF or CRLF, a UTF-8 BOM, tabs, trailing comments, patch versions such as `go 1.24.3`, and prerelease versions. Keep the full `goVersion` for toolchain requirements and use the numeric major/minor `languageVersion` to select feature-reference sections.

If Node is unavailable, read the module file with the available file tool or the host's native shell; installing Node or Go is not necessary just to read this directive. For an already located module file, PowerShell supports:

```powershell
$goModPath = 'C:\path\to\target\go.mod'
Get-Content -LiteralPath $goModPath | Select-String -Pattern '^\s*go\s+'
```

Use the actual path and inspect the matched directive. Do not assume `grep`, `sed`, `awk`, or a working Bash/WSL installation on Windows. A read or parse failure is different from a missing module: inspect the reported path and raw file before asking for a version. If no module or usable version declaration can be found, ask for the intended compatibility target instead of guessing.

The `toolchain` directive, a workspace's `go.work` version, and `go version` describe different constraints or the selected runtime; do not substitute them for the target module's `go` directive. If using `go env GOMOD` as an optional locator, treat an empty result, `NUL` on Windows, or `/dev/null` on Unix as no module, never as a readable file. See the official [Go toolchain rules](https://go.dev/doc/toolchain) and [GOMOD documentation](https://pkg.go.dev/cmd/go#hdr-Environment_variables).

State the detected version and source `go.mod` once, then proceed. Do not modify `go.mod`, `go.work`, or persistent Go environment settings merely to detect a version.

## Working Rules

- Use modern Go features and APIs up to and including the detected version.
- Do not use features introduced after the target version.
- Prefer standard-library improvements over legacy hand-written patterns when they clearly improve readability.
- Keep code idiomatic for the repository; modernizing syntax must not fight existing architectural constraints.
- When reviewing code, call out places where an older pattern should be replaced by a clearer modern alternative for the target version.

## Reference

Read [references/features-by-go-version.md](references/features-by-go-version.md) and apply all entries up to the target Go version.
