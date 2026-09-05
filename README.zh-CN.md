# codex-skills

[English](README.md) | 简体中文

一组可复用的 Codex 技能，涵盖技术方案设计、Go 开发、翻译和 MySQL 故障初步排查。每项技能提供聚焦的工作流程，并按需附带参考资料或脚本。

## 选择技能

| 技能 | 用途 | 适用范围 |
| --- | --- | --- |
| [solution-design](skills/solution-design/SKILL.md) | 为新功能、架构调整或复杂修复选择合适的实现方案 | 涉及实质性技术取舍；不用于常规小改动、单纯故障定位或视觉样式调整 |
| [use-modern-go](skills/use-modern-go/SKILL.md) | 使用现代 Go 语言特性和标准库编写、重构或评审代码 | 仅使用当前模块 Go 版本支持的特性 |
| [translate](skills/translate/SKILL.md) | 翻译或本地化文本、文档和 Markdown | 复用翻译偏好，保持术语一致和原文结构 |
| [mysql-dba-copilot](skills/mysql-dba-copilot/SKILL.md) | 根据粘贴的诊断输出排查 MySQL 变慢问题 | 面向没有专职 DBA 的工程师，适用于 MySQL 5.7 和 8.0 的故障初步排查 |

## 使用方式

安装技能后，输入 `$skill-name` 并描述任务即可调用。本仓库的技能指令主要使用英文；调用时可以使用中文或英文，也可以明确指定回答语言。

### solution-design

根据任务需要应用以下原则，形成可实施的技术方案：

- 明确目标、成功标准和当前约束。
- 检查项目已有能力及适用的官方方案。
- 推荐与任务规模相称的方案，说明有实际影响的取舍。
- 找出最可能使方案失效的假设，并在可行时验证。
- 根据合理的负载预期和恢复需求，检查相关失败情形。
- 明确关键接口、数据流和可观察的验收标准。

分析深度取决于决策的影响和不确定性。普通编码细节留给实施阶段，不强制规定备选方案数量，不按文件数量设置暂停条件，也不为已授权的工作增加单独的审批关卡。

只分析方案：

```text
$solution-design 先分析这个功能的实现方案，说明关键取舍、尚未验证的假设和验收标准，暂时不要修改代码。
```

设计后直接实施：

```text
$solution-design 根据现有项目选择合适方案，直接实现并验证；只有无法从上下文判断的关键决策才询问我。
```

只要求规划时，技能保持只读。要求实施时，仍遵循既有的任务范围和授权边界。只有任务需要时，才创建详细交接文档或计划文件。

### use-modern-go

根据相关 `go.mod` 声明的版本，使用该版本支持的特性改进 Go 代码。技能会先检查目标版本，优先采用合适的标准库改进，并遵循仓库惯例。

随附的版本检测脚本从明确指定的目标文件或目录向上查找最近的 `go.mod`。脚本使用 Node.js，可在 Windows、macOS 和 Linux 运行，无需调用 Go 或 Unix 工具，并支持 CRLF 换行、UTF-8 BOM、带空格或中文的路径以及补丁版本号。没有 Node.js 时，技能也提供原生文件读取方式。本机工具链版本不会覆盖模块声明的兼容性目标。

```text
$use-modern-go 按照 go.mod 声明的版本，用现代 Go 写法改进这段代码。
```

随附参考资料见 [Go 各版本特性](skills/use-modern-go/references/features-by-go-version.md)。

### translate

使用 `faithful`（忠实翻译）、`literal`（直译）或 `localized`（本地化）模式，将内容翻译为中文或英文。保留 Markdown 结构、代码块、链接和术语；当一致性或上下文限制需要时，对长文分块处理并合并结果。

```text
$translate 把这篇技术文档翻译成中文，保留 Markdown 格式、代码块和专有名词。
```

```text
$translate 把这段产品文案本地化为自然的英文。
```

首次使用时，技能会在 `~/.codex/skills/translate/config.json` 创建偏好配置。默认目标语言为 `zh-CN`，默认模式为 `faithful`；当前请求优先于已保存的偏好。配置支持语气、格式保留、术语表和 `do_not_translate` 词项。

详见 [配置说明](skills/translate/references/config.md) 和 [翻译模式](skills/translate/references/modes.md)。

### mysql-dba-copilot

根据粘贴的 `SHOW VARIABLES`、`SHOW PROCESSLIST`、`SHOW ENGINE INNODB STATUS`、慢查询日志及症状描述等证据，初步排查数据库变慢问题。此流程无需直接访问数据库。

```text
$mysql-dba-copilot 根据下面的诊断输出分析这次 MySQL 变慢事件，说明最可能的瓶颈、支持证据，以及按优先级排列的处理建议和风险。
```

报告会区分观察结果和假设，说明置信度、下一步值得检查的内容，并按操作风险分组提出建议。该技能聚焦故障初步排查，不承担通用数据库管理，也不生成完整配置文件。

可以参考 [输入模板](skills/mysql-dba-copilot/references/input-template.md) 整理材料；证据不完整时也可使用。

## 安装

选择需要的技能目录。仅将仓库保存在本地，不会自动将其中的技能安装到用户技能目录。

### 从 GitHub 安装

让 Codex 使用内置安装器：

```text
$skill-installer 从 GitHub 仓库 bobbyz3g/codex-skills 的 skills/solution-design 路径安装 solution-design 技能。
```

也可以使用 Python 运行随附安装脚本：

```bash
python ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo bobbyz3g/codex-skills \
  --path skills/solution-design
```

将 `solution-design` 替换为上表中的其他技能名称即可。上述命令使用 Bash 语法和默认 Codex 主目录；如果你的安装位置不同，请调整脚本路径。

GitHub 安装读取远程仓库内容。本地新增的技能需要先推送到所选远程分支，才能通过这种方式安装。

### 从本地仓库安装

要在发布前使用技能，可以让 Codex 将完整技能目录从本地仓库复制到用户技能目录：

```text
把当前本地仓库中的 skills/solution-design 安装到我的 Codex 用户技能目录。如果已有同名技能，请在替换前展示差异。
```

默认目标位置通常为 `~/.codex/skills/<skill-name>`；如果配置了 `CODEX_HOME`，则使用 `$CODEX_HOME/skills/<skill-name>`。请复制整个目录，以保留参考资料、脚本和 `agents/openai.yaml`。

如果安装后未显示技能，请重启 Codex。

## 仓库结构

```text
skills/
  solution-design/
  use-modern-go/
  translate/
  mysql-dba-copilot/
```

每项技能包含：

- `SKILL.md`：用途、用于选择技能的描述和具体指令。
- `agents/openai.yaml`：界面展示信息和调用示例。
- 按工作流程需要添加的 `references/`、`scripts/` 或 `assets/` 目录。

## 致谢

`use-modern-go` 技能受到 [JetBrains Go Modern Guidelines](https://github.com/JetBrains/go-modern-guidelines) 的启发。
