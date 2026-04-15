---
name: translate
description: Translate or localize text, documents, and Markdown with reusable preferences, long-text chunking, and terminology controls. Use when the user asks to translate, rewrite into another language, localize copy, or preserve formatting while translating technical or structured content.
metadata:
  short-description: Translate with reusable preferences and chunking
---

# Translate

Use this skill for translation and localization work, especially when the user wants:

- translation into Chinese or English
- terminology consistency across a long document
- formatting preserved for Markdown, code blocks, links, and lists
- a reusable translation preference profile

## Defaults

- Default target language: `zh-CN`
- Default mode: `faithful`
- Default output: translation only, no commentary unless requested

Preference order:

1. The user's explicit request in the current task
2. User config at `~/.codex/skills/translate/config.json`
3. Skill defaults

## First Run

Before translating, check whether `~/.codex/skills/translate/config.json` exists.

If it does not exist:

1. Gather the user's preferences for target language, mode, tone, formatting preservation, glossary, and non-translatable terms.
2. Save them with `node scripts/init-config.js` from this skill directory.
3. Proceed with translation only after the config file has been created.

Use interactive setup when a TTY is available:

```bash
node scripts/init-config.js --interactive
```

Use flags when you already know the preferences:

```bash
node scripts/init-config.js \
  --default-target-language zh-CN \
  --default-mode faithful \
  --tone neutral \
  --preserve-formatting true
```

## Workflow

1. Detect the source language and the requested target language.
2. If the target language is not specified, translate to `zh-CN`.
3. Resolve preferences from the current task and the user config.
4. Pick the translation mode:
   - `literal`: quick, close to the source wording
   - `faithful`: accurate and natural, default
   - `localized`: adapt tone and phrasing for the target audience without changing facts
5. Preserve structure:
   - keep headings, lists, links, tables, and code fences intact
   - do not translate code, commands, file paths, or identifiers unless the user asks
   - apply glossary and `do_not_translate` consistently
6. For long inputs, split them before translating:

```bash
node scripts/chunk-text.js --input <file-or-> --max-chars 2200
```

Translate chunk by chunk, then merge:

```bash
node scripts/merge-output.js --input <translated-chunks.json>
```

## Long Text Handling

Use chunking when the input is long enough that consistency or context window pressure becomes a risk.

- Prefer chunk boundaries at paragraph breaks.
- Keep each chunk structurally coherent.
- After chunked translation, scan the full merged output for:
  - inconsistent terminology
  - broken list numbering
  - duplicated headings
  - damaged Markdown or code fences

## Reference

Read these files as needed:

- [references/modes.md](references/modes.md) for mode selection and output expectations
- [references/config.md](references/config.md) for config schema and CLI usage
- [references/style-guide.md](references/style-guide.md) for formatting, glossary, and technical-text rules
