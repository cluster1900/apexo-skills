# `cn-tender-review` — China Tender Compliance Pre-Review Skill / 中国招标文件合规预审技能

[简体中文](#简体中文) | [English](#english)

---

## 简体中文

`cn-tender-review` 是面向中国招投标与政府采购场景定制的 Apexo Agent Skill / Plugin 包：支持对招标文件（`PDF`、`DOCX`、`TXT`、`MD`）按结构化清单执行合规预审，自动输出带**严重级别（`severity`）**、**原文定位（`location`）**、**法条引用（`law_refs`）**与**可执行修改建议（`suggestion`）**的 Markdown + JSON 报告。

> **免责声明**
> 本技能基于公开法规条文与常见实务检查清单提供辅助性预审，可能存在误报、漏报与地区性特殊规定未覆盖的情况。**输出不构成法律意见或招标执业意见。** 发标、投诉、应标等正式行为请咨询具备资质的专业人员，并以现行有效法律、规章、标准招标文件及项目主管机关要求为准。

### 安装方式

#### 1. Apexo CLI / Desktop Plugins 安装（推荐）
```bash
# 固定 v0.1.0 版本安装
apexo plugins install --source cluster1900/apexo-skills@v0.1.0#skills/cn-tender-review --trust

# 查看详情或卸载
apexo plugins details cn-tender-review
apexo plugins uninstall cn-tender-review
```
或在 Apexo Desktop → **Plugins（插件）** → **自行安装** 中输入：
```text
cluster1900/apexo-skills@v0.1.0#skills/cn-tender-review
```

#### 2. Release 压缩包安装
从 [GitHub Releases](https://github.com/cluster1900/apexo-skills/releases/tag/v0.1.0) 下载 `cn-tender-review-v0.1.0.zip` 与 `SHA256SUMS`：
```bash
shasum -a 256 -c SHA256SUMS
mkdir -p .apexo/skills/cn-tender-review
unzip cn-tender-review-v0.1.0.zip -d .apexo/skills/cn-tender-review
```

### 使用示例

在 Apexo 会话中上传或指定工作区内的招标文件：
```text
请使用 cn-tender-review 技能审核这份招标文件：./招标文件-智慧园区弱电工程.pdf
```

### 核心审查维度与法定红线（27 项稳定规则 ID）

| 类别 | 规则 ID | 核心检查要点 | 法规依据 |
| --- | --- | --- | --- |
| **0. 文本可提取性** | `SCAN-NO-TEXT-LAYER` | 扫描版无文本层 PDF 强制报错降级并提示 OCR，不假装已审 | 预审前置真实性要求 |
| **A. 法定时限** | `TIME-BID-PREP-20D` | 依法必须招标 / 政府采购公开招标等标期 **≥20 日** | 《招标投标法》第 24 条；87 号令第 20 条 |
| **A. 法定时限** | `TIME-SALE-5D` / `TIME-PQ-5D` | 标书/资审文件发售期 **≥5 日**；资审提交期自停售起 **≥5 日** | 《招标投标法实施条例》第 16、17 条 |
| **A. 法定时限** | `TIME-CLARIFY-15D` | 影响投标编制的澄清修改须在截止 **至少 15 日前** 通知，否则顺延 | 《招标投标法》第 23 条；《实施条例》第 21 条 |
| **A. 政采时限** | `TIME-GP-PROVIDE-5WD` / `TIME-GP-ANNOUNCE-5WD` | 政府采购标书提供期限及公告期限 **≥5 个工作日**（扣除周末及法定节假日） | 财政部令第 87 号第 16、18 条 |
| **B. 保证金与费用** | `BOND-BID-2PCT` / `BOND-GP-2PCT` | 投标保证金 **≤项目估算价/采购预算的 2%**；政采必须为 **非现金形式** | 《实施条例》第 26 条；《政采实施条例》第 33 条 |
| **B. 保证金与费用** | `FEE-DOC-COST-ONLY` | 标书售价限于弥补印刷邮寄成本，不得按预算比例收费或营利 | 《实施条例》第 16 条；87 号令第 24 条 |
| **C. 歧视/排他** | `DISC-REGION` / `DISC-BRAND` | 严禁本地分公司/本地社保纳税/特定行政区域业绩加分；严禁指定品牌型号 | 《招标投标法》第 18、20 条；《实施条例》第 32 条 |
| **C. 歧视/排他** | `DISC-AUTH-OEM` / `DISC-QUAL-OVERSPEC` / `DISC-JOINT` | 严禁非进口产品要求原厂唯一授权函；严禁过高资质业绩门槛或强制联合体 | 财政部令第 87 号第 17 条；《招标投标法》第 18、31 条 |
| **D. 评标办法** | `EVAL-GP-PRICE-WEIGHT` / `EVAL-QUAL-AS-SCORE` / `EVAL-WEIGHT-SUM` | 政采综合评分法货物价格分 **≥30%**、服务 **≥10%**；严禁规模条件（营收/人员/纳税/注册资本）或资格条件作为评分项；总分须等于 100 | 财政部令第 87 号第 17、55 条 |
| **E. 内部一致性** | `CONSIST-TIMELINE-CONFLICT` / `CONSIST-MISSING-SECTION` / `CONSIST-AMOUNT-TERM` / `CONSIST-ADDENDUM` | 开标时间必须与投标截止时间同一时间；大小写金额、工期、补遗前后一致 | 《招标投标法》第 19、23、34 条 |
| **F. 合同风险** | `CONTRACT-SUBSTANTIVE-CHANGE` / `CONTRACT-PAYMENT-EXTREME` / `CONTRACT-UNLIMITED-LIAB` / `CONTRACT-UNILATERAL-TERM` | 严禁中标后二次议价下浮或背离实质性内容；提示背靠背付款、质保金 >3%、无限责任红旗 | 《招标投标法》第 46 条；《政府采购法》第 46 条 |

### 目录结构与本地回归验证

- [`SKILL.md`](SKILL.md)：主指令文件
- [`references/laws-and-regulations.md`](references/laws-and-regulations.md)：核心法规条文摘录与公开链接
- [`references/checklist-rules.md`](references/checklist-rules.md)：27 项规则判据与修改建议模板
- [`references/report-template.md`](references/report-template.md)：标准 Markdown + JSON 报告模板
- [`examples/`](examples/)：`S1`（合规基线）、`S2`（时限违规）、`S3`（地域/品牌/原厂授权歧视 + 3%保证金）、`S4`（政府采购口径）脱敏样例与期望 Finding 列表
- [`scripts/verify-examples.mjs`](scripts/verify-examples.mjs)：纯本地只读校验脚本（无网络外联、无密钥）

```bash
# 在当前目录运行回归校验
node scripts/verify-examples.mjs

# 对指定招标文件执行本地规则预检
node scripts/verify-examples.mjs --audit examples/S3-discriminatory-and-bond-3pct.md
```

---

## English

`cn-tender-review` is a custom Agent Skill & Plugin bundle for reviewing Chinese bidding and government procurement tender documents (`PDF`, `DOCX`, `TXT`, `MD`). It checks statutory timelines, bid bond caps (`≤2%`), discriminatory/exclusive qualification clauses, evaluation score weights, and contract red flags against PRC Bidding Law and Ministry of Finance Order No. 87, producing a structured Markdown + JSON report with severity levels, exact citations, and actionable remediation suggestions.

> **Disclaimer**: This skill provides assistive pre-review based on public regulations and common practice checklists. **It does not constitute formal legal advice.**

### Quick Install
```bash
apexo plugins install --source cluster1900/apexo-skills@v0.1.0#skills/cn-tender-review --trust
```
