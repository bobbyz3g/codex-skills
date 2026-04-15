# Style Guide

## Preserve Structure

- Keep Markdown headings, lists, tables, and block quotes intact.
- Keep links intact. Translate link text when appropriate, but do not alter URLs.
- Keep fenced code blocks unchanged unless the user explicitly asks to translate comments inside them.
- Keep commands, file paths, environment variables, API names, and identifiers unchanged by default.

## Terminology

- Apply glossary mappings consistently across the full output.
- Respect `do_not_translate` before glossary substitutions.
- For product names and proper nouns, prefer the user's established form if one exists.
- If the source uses a term inconsistently, normalize it in the target language unless the inconsistency is meaningful.

## Technical Content

- Translate explanatory prose around code, not the code itself.
- Keep shell snippets executable.
- Preserve inline code spans exactly.
- Preserve numbering and bullet order.

## Chinese Output

- Prefer concise modern Simplified Chinese.
- Avoid mechanical word-for-word renderings when `faithful` or `localized` mode is active.
- Use established Chinese technical terms when they improve clarity.

## English Output

- Prefer plain, direct English.
- Remove obvious translationese.
- Use domain-standard terminology rather than literal back-translations.

## Quality Checks

Before finalizing, scan for:

- broken Markdown
- repeated headings or duplicated paragraphs
- inconsistent rendering of glossary terms
- accidental translation of code, commands, or file paths
- tone mismatch with the selected mode
