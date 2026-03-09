---
name: use-modern-go
description: Apply modern Go syntax and standard library APIs that are valid for the active repository's target Go version. Use when writing, refactoring, or reviewing Go code and the user wants modern Go style without relying on features newer than the module version.
---

# Use Modern Go

Use this skill when the task involves writing, refactoring, or reviewing Go code and modern language or standard-library features may matter.

## Version Selection

Determine the target Go version from the repository before editing code.

- Prefer the nearest `go.mod` for the files being changed.
- If the task is repository-wide and there is a root `go.mod`, use that version.
- If no `go.mod` is available, ask the user which Go version to target.
- If multiple modules apply and the correct one is unclear, state the assumption you are making before editing.

After detecting the version, state it once in a short sentence and proceed.

## Working Rules

- Use modern Go features and APIs up to and including the detected version.
- Do not use features introduced after the target version.
- Prefer standard-library improvements over legacy hand-written patterns when they clearly improve readability.
- Keep code idiomatic for the repository; modernizing syntax must not fight existing architectural constraints.
- When reviewing code, call out places where an older pattern should be replaced by a clearer modern alternative for the target version.

## Reference

Read [references/features-by-go-version.md](references/features-by-go-version.md) and apply all entries up to the target Go version.
