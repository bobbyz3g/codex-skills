# codex-skills

English | [简体中文](README.zh-CN.md)

Reusable Codex skills for technical design, Go development, translation, and MySQL incident triage. Each skill provides a focused workflow and, where useful, supporting references or scripts.

## Choose a Skill

| Skill | Use it for | Scope |
| --- | --- | --- |
| [solution-design](skills/solution-design/SKILL.md) | Choosing a practical approach for a feature, architecture change, or complex fix | Meaningful technical tradeoffs; skips routine edits, pure debugging, and visual styling |
| [use-modern-go](skills/use-modern-go/SKILL.md) | Writing, refactoring, or reviewing Go code with modern language and library features | Features supported by the active module's Go version |
| [translate](skills/translate/SKILL.md) | Translating or localizing text, documents, and Markdown | Reusable preferences, terminology consistency, and structure preservation |
| [mysql-dba-copilot](skills/mysql-dba-copilot/SKILL.md) | Investigating a slow MySQL incident from pasted diagnostic output | MySQL 5.7 and 8.0 incident triage for engineers without a dedicated DBA |

## Usage

After installing a skill, invoke it with `$skill-name` and describe the task. Instructions in this repository are primarily in English; prompts can be in Chinese or English, with an explicit output language when needed.

### solution-design

Develop an implementable design using the principles relevant to the task:

- establish the goal, success criteria, and current constraints;
- check existing project capabilities and suitable official approaches;
- recommend a proportionate solution and explain meaningful tradeoffs;
- identify and, where practical, verify the assumption most likely to invalidate the design;
- examine relevant failure cases using plausible workloads and recovery needs; and
- define key interfaces, data flow, and observable acceptance criteria.

The skill scales its depth to the decision's consequence and uncertainty. It leaves routine coding details to implementation and does not impose fixed numbers of alternatives, file-count thresholds, or a separate approval gate for already authorized work.

For a planning-only request:

```text
$solution-design 先分析这个功能的实现方案，说明关键取舍、尚未验证的假设和验收标准，暂时不要修改代码。
```

For design followed by implementation:

```text
$solution-design 根据现有项目选择合适方案，直接实现并验证；只有无法从上下文判断的关键决策才询问我。
```

A planning-only request remains read-only. Implementation requests retain their existing scope and authorization boundaries. A detailed handoff or plan file is created only when the task calls for one.

### use-modern-go

Modernize Go code using features available in the relevant `go.mod` version. The skill checks the target version first, prefers suitable standard-library improvements, and preserves repository conventions.

```text
Use $use-modern-go to modernize this Go code for the version declared in go.mod.
```

See [features by Go version](skills/use-modern-go/references/features-by-go-version.md) for the bundled reference.

### translate

Translate into Chinese or English using `faithful`, `literal`, or `localized` mode. Preserve Markdown structure, code blocks, links, and terminology; split and merge long inputs when consistency or context limits require it.

```text
$translate 把这篇技术文档翻译成中文，保留 Markdown 格式、代码块和专有名词。
```

```text
$translate localize this product copy into natural English.
```

On first use, the skill creates a preference file at `~/.codex/skills/translate/config.json`. Defaults are target language `zh-CN` and mode `faithful`; the current request takes precedence over saved preferences. Configuration includes tone, formatting preservation, a glossary, and `do_not_translate` terms.

See [configuration](skills/translate/references/config.md) and [translation modes](skills/translate/references/modes.md).

### mysql-dba-copilot

Triage a database slowdown using pasted evidence such as `SHOW VARIABLES`, `SHOW PROCESSLIST`, `SHOW ENGINE INNODB STATUS`, slow-query logs, and symptom notes. The workflow does not require direct database access.

```text
Use $mysql-dba-copilot to analyze this slow MySQL incident from the diagnostic output below. Explain the likely bottleneck, supporting evidence, and prioritized actions with their risks.
```

The report separates observations from hypotheses, states confidence, identifies the next useful checks, and groups actions by operational risk. It focuses on incident triage rather than general database administration or generating full configuration files.

Start with the [input template](skills/mysql-dba-copilot/references/input-template.md); partial evidence is accepted.

## Installation

Choose the skill directory you need. Keeping this repository on disk does not by itself install its skills into your user skill directory.

### From GitHub

Ask Codex to use its built-in installer:

```text
$skill-installer Install solution-design from the GitHub repository bobbyz3g/codex-skills at skills/solution-design.
```

Alternatively, run the bundled installer with Python:

```bash
python ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo bobbyz3g/codex-skills \
  --path skills/solution-design
```

Replace `solution-design` with any skill name from the table above. The command shown uses Bash syntax and the default Codex home; adjust the script path if your installation uses a different location.

GitHub installation reads the remote repository. Local additions must be pushed to the selected remote branch before they can be installed this way.

### From a Local Checkout

To use a skill before publishing it, ask Codex to copy the complete skill directory from your checkout into your user skill directory:

```text
Install skills/solution-design from this local checkout into my Codex user skills directory. If a skill with that name already exists, show the differences before replacing it.
```

The usual destination is `~/.codex/skills/<skill-name>`; use `$CODEX_HOME/skills/<skill-name>` when `CODEX_HOME` is configured. Copy the whole directory so references, scripts, and `agents/openai.yaml` remain available.

Restart Codex if the installed skill does not appear.

## Repository Layout

```text
skills/
  solution-design/
  use-modern-go/
  translate/
  mysql-dba-copilot/
```

Each skill contains:

- `SKILL.md`: purpose, selection description, and instructions.
- `agents/openai.yaml`: display metadata and an example invocation prompt.
- Optional `references/`, `scripts/`, or `assets/` when the workflow needs them.

## Attribution

The `use-modern-go` skill was inspired by [JetBrains Go Modern Guidelines](https://github.com/JetBrains/go-modern-guidelines).
