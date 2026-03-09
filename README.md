# codex-skills

Shareable Codex skills for publication and reuse.

## Skills

- `skills/use-modern-go`: Apply modern Go syntax and standard library APIs that match the target module version.

## Attribution

The `use-modern-go` skill was inspired by JetBrains Go Modern Guidelines:
https://github.com/JetBrains/go-modern-guidelines

## Repository Layout

Each skill lives in its own folder under `skills/` and should include:

- `SKILL.md`
- `agents/openai.yaml` when UI metadata is useful
- optional `references/`, `scripts/`, or `assets/`

## Publishing

Push this repository to GitHub or another git host, then install a skill from it with:

```bash
python ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo <owner>/codex-skills \
  --path skills/use-modern-go
```

After installation, restart Codex to pick up the new skill.
