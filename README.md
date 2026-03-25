# codex-skills

Shareable Codex skills for installation and reuse.

## Skills

- `skills/use-modern-go`: Apply modern Go syntax and standard library APIs that match the target module version.
- `skills/mysql-dba-copilot`: Triage a slow MySQL incident from pasted evidence and return an evidence-first report with risk-tiered guidance for non-DBA engineers. Focuses on slow SQL, lock waits, connection saturation, InnoDB memory pressure, and IO / flush pressure.

## Attribution

The `use-modern-go` skill was inspired by JetBrains Go Modern Guidelines:
https://github.com/JetBrains/go-modern-guidelines

## Repository Layout

Each skill lives in its own folder under `skills/` and should include:

- `SKILL.md`
- `agents/openai.yaml` when UI metadata is useful
- optional `references/`, `scripts/`, or `assets/`

## Install Skills

Install a skill from this repository with:

```bash
python ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo bobbyz3g/codex-skills \
  --path skills/<skill-you-want-to-install>
```

Examples:

```bash
python ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo bobbyz3g/codex-skills \
  --path skills/use-modern-go

python ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo bobbyz3g/codex-skills \
  --path skills/mysql-dba-copilot
```

After installation, restart Codex to pick up the new skill.
