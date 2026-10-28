# Apexo Skills (`cluster1900/apexo-skills`)

[English](#english) | [简体中文](#简体中文)

---

## English

**Apexo Skills** is the public Agent Skills & Plugins repository for [Apexo (`cluster1900/apexo-code`)](https://github.com/cluster1900/apexo-code). Domain-specific, workflow-specific, and custom community skills are maintained and versioned here as standalone packages rather than bundled into the core Apexo runtime.

### Available Skills Index

| Skill | Version | Category | Description | Documentation |
| --- | --- | --- | --- | --- |
| **[`cn-tender-review`](skills/cn-tender-review/README.md)** | `0.1.0` | Compliance / Legal Tech | China tender document compliance pre-review (statutory timelines, bid bond limits, discriminatory clauses, and structured audit reports). *Not legal advice.* | [README](skills/cn-tender-review/README.md) |

### How to Install Skills

#### 1. Via Apexo Plugins (Recommended — Desktop & CLI)
- **CLI (install a specific skill by tag)**:
  ```bash
  apexo plugins install --source cluster1900/apexo-skills@v0.1.0#skills/<skill-name> --trust
  ```
- **CLI (subscribe to the entire catalog)**:
  ```bash
  apexo plugins add-source https://github.com/cluster1900/apexo-skills.git
  apexo plugins refresh
  apexo plugins install 'apexo-skills:<skill-name>' --trust
  ```
- **Desktop GUI**:
  Open **Plugins** from the sidebar (or `Cmd+K` / `Ctrl+K` → `Plugins`), click **Install Custom** to paste `cluster1900/apexo-skills@v0.1.0#skills/<skill-name>`, or add `https://github.com/cluster1900/apexo-skills.git` under the **Sources** tab.

#### 2. Via GitHub Release Archive (Offline / Local Path)
Download `<skill-name>-vX.Y.Z.zip` and `SHA256SUMS` from [Releases](https://github.com/cluster1900/apexo-skills/releases), verify the checksum, and extract into `.apexo/skills/<skill-name>` (project) or `~/.config/apexo/skills/<skill-name>` (global).

#### 3. Via `skills.urls` in `apexo.json`
```json
{
  "skills": {
    "urls": [
      "https://raw.githubusercontent.com/cluster1900/apexo-skills/main/skills/"
    ]
  }
}
```

### Contributing a New Skill

Each skill lives under `skills/<skill-name>/` and should include:
- `SKILL.md` (with required `name` and `description` YAML frontmatter)
- `README.md` (skill-specific documentation, usage, and installation commands)
- `plugin.json` & `manifest.json`
- `references/`, `examples/`, and optional read-only `scripts/`
- `LICENSE` & `CHANGELOG.md`

---

## 简体中文

**Apexo Skills** 是 [Apexo (`cluster1900/apexo-code`)](https://github.com/cluster1900/apexo-code) 的公共扩展 Agent Skills 与 Plugins 仓库。各类垂直领域、特定业务流及定制化 Skill 均在此独立维护并按版本发布，**不内置进 Apexo 核心发行包**，支持按需安装、版本锁定与随时卸载。

### 技能目录索引（Skills Index）

| 技能名称 | 最新版本 | 分类 | 简介 | 详细说明 |
| --- | --- | --- | --- | --- |
| **[`cn-tender-review`](skills/cn-tender-review/README.md)** | `0.1.0` | 合规预审 / 招投标 | 中国招标文件合规预审技能（法定时限、保证金比例、排他/歧视性条款、评标权重与合同红旗检查，输出带法条引用的结构化报告）。*非法律意见。* | [查看文档](skills/cn-tender-review/README.md) |

### 通用安装方式

#### 1. 通过 Apexo Plugins 安装（推荐，Desktop 与 CLI 通用）
- **CLI 按版本安装单个技能**：
  ```bash
  apexo plugins install --source cluster1900/apexo-skills@v0.1.0#skills/<skill-name> --trust
  ```
- **CLI 添加整个技能仓库源**：
  ```bash
  apexo plugins add-source https://github.com/cluster1900/apexo-skills.git
  apexo plugins refresh
  apexo plugins install 'apexo-skills:<skill-name>' --trust
  ```
- **Desktop 桌面端安装**：
  打开左侧栏 **Plugins（插件）**（或按 `Cmd+K` / `Ctrl+K` 搜索 `Plugins`），点击 **「自行安装」** 填入 `cluster1900/apexo-skills@v0.1.0#skills/<skill-name>`，或在 **「来源」** 页添加 `https://github.com/cluster1900/apexo-skills.git`。

#### 2. 通过 GitHub Release 压缩包安装（支持离线）
前往 [Releases](https://github.com/cluster1900/apexo-skills/releases) 下载对应技能的 `<skill-name>-vX.Y.Z.zip` 与 `SHA256SUMS`，校验哈希后解压至项目的 `.apexo/skills/<skill-name>` 或全局 `~/.config/apexo/skills/<skill-name>`。

#### 3. 通过 `apexo.json` 的 `skills.urls` 远程加载
```json
{
  "skills": {
    "urls": [
      "https://raw.githubusercontent.com/cluster1900/apexo-skills/main/skills/"
    ]
  }
}
```

---

## License

[MIT License](skills/cn-tender-review/LICENSE)
