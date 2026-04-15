# codex-skills

Reusable Codex skills for development, operations, and writing workflows.

## Available Skills

### use-modern-go

`skills/use-modern-go` helps Codex write, refactor, and review Go code using language features and standard-library APIs that match the active module version.

Typical uses:

- modernizing older Go syntax without exceeding the repository's Go version
- preferring standard-library improvements over custom compatibility code
- reviewing code for places where a clearer modern pattern should be used

Typical trigger:

- `Use $use-modern-go to modernize this Go code for the version declared in go.mod.`

### translate

`skills/translate` is a general-purpose translation skill for Codex. It is designed for document-style translation work rather than one-off sentence conversion, with an emphasis on reusable preferences and structure preservation.

It supports:

- translation into Chinese or English
- faithful translation, literal translation, and localized rewriting
- preserved Markdown structure, links, lists, and code fences
- user-level preferences in `~/.codex/skills/translate/config.json`
- glossary and `do_not_translate` controls
- long-text chunking and merged output for larger documents

Typical triggers:

- `$translate 把这段英文翻译成中文，并保留 Markdown 格式`
- `$translate localize this product copy into natural Chinese`
- `把这篇技术文档翻译成英文，不要改代码块`

On first use, the skill checks for a user config file and initializes one if needed. By default, it translates into `zh-CN` and uses `faithful` mode unless the current request says otherwise.

### mysql-dba-copilot

`skills/mysql-dba-copilot` helps Codex triage a slow MySQL incident from pasted evidence and produce an evidence-first report with risk-tiered actions for non-DBA engineers.

Typical uses:

- diagnosing one-off production slowdowns without direct database access
- analyzing pasted `SHOW VARIABLES`, `SHOW PROCESSLIST`, and `SHOW ENGINE INNODB STATUS`
- separating likely bottlenecks such as slow SQL, lock contention, connection pressure, memory pressure, and IO pressure

Typical trigger:

- `Use $mysql-dba-copilot to analyze this slow MySQL incident from pasted outputs and produce a risk-tiered triage report.`

## Repository Layout

Each skill lives in its own folder under `skills/` and should include:

- `SKILL.md`
- `agents/openai.yaml` when UI metadata is useful
- optional `references/`, `scripts/`, or `assets/`

## Installation

Install a skill from this repository by choosing the skill path:

```bash
python ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo bobbyz3g/codex-skills \
  --path skills/<skill-you-want-to-install>
```

Examples:

Install `use-modern-go`:

```bash
python ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo bobbyz3g/codex-skills \
  --path skills/use-modern-go
```

Install `translate`:

```bash
python ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo bobbyz3g/codex-skills \
  --path skills/translate
```

Install `mysql-dba-copilot`:

```bash
python ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo bobbyz3g/codex-skills \
  --path skills/mysql-dba-copilot
```

After installation, restart Codex to pick up the new skill.

## Attribution

The `use-modern-go` skill was inspired by JetBrains Go Modern Guidelines:
https://github.com/JetBrains/go-modern-guidelines
