# Config

The user-level config file lives at:

`~/.codex/skills/translate/config.json`

This file stores reusable preferences for translation tasks.

## Schema

```json
{
  "version": 1,
  "default_target_language": "zh-CN",
  "default_mode": "faithful",
  "tone": "neutral",
  "preserve_formatting": true,
  "glossary": {
    "agent": "智能体"
  },
  "do_not_translate": [
    "Codex",
    "OpenAI"
  ]
}
```

## Field Meanings

- `default_target_language`: fallback target language when the user does not specify one
- `default_mode`: one of `literal`, `faithful`, `localized`
- `tone`: preferred target tone such as `neutral`, `concise`, `formal`, or `friendly`
- `preserve_formatting`: whether Markdown and structural formatting should be preserved by default
- `glossary`: source-to-target term mapping that should be applied consistently
- `do_not_translate`: terms that should remain unchanged

## CLI Usage

Create a config with defaults:

```bash
node scripts/init-config.js --ensure
```

Show the resolved config:

```bash
node scripts/init-config.js --show
```

Update fields:

```bash
node scripts/init-config.js \
  --default-target-language en \
  --default-mode localized \
  --tone concise \
  --glossary 智能体=agent \
  --do-not-translate Codex
```

## Precedence

Resolve preferences in this order:

1. Explicit instructions in the current user request
2. Values from this config file
3. Built-in defaults from the skill
