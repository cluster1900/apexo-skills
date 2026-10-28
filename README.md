# Apexo Skills 公共库 (`cluster1900/apexo-skills`)

本仓库是 [Apexo (`cluster1900/apexo-code`)](https://github.com/cluster1900/apexo-code) 的官方公共扩展 Skills / Plugins 仓库。所有垂直领域与法域专用技能均在此独立版本化发布，**不内置进 `apexo-code` 发行包**，用户可按需通过 Apexo **Plugins 商城**、**CLI `apexo plugins install`** 或 **`skills.urls` / `skills.paths`** 安装、固定版本与随时卸载。

> **免责声明**
> 本仓库收录的合规与审查技能（如 `cn-tender-review`）基于公开法规条文与常见实务检查清单提供辅助性预审，可能存在误报、漏报与地区性特殊规定未覆盖的情况。**输出不构成法律意见或招标执业意见。** 发标、投诉、应标等正式行为请咨询具备资质的专业人员，并以现行有效法律、规章、标准招标文件及项目主管机关要求为准。

---

## 目录索引

| Skill / Plugin 名称 | 最新版本 | 规则集版本 | 简要说明 | 目录位置 |
| --- | --- | --- | --- | --- |
| [`cn-tender-review`](skills/cn-tender-review/) | `0.1.0` | `2026-10-28` | 中国招标文件合规预审（法定时限、保证金 ≤2%、排他/歧视性条款、政府采购 87 号令价格分权重、合同红旗审查，输出带严重级别与法条引用的结构化报告） | [`skills/cn-tender-review`](skills/cn-tender-review/) |

---

## 安装指南（零基础三选一）

### 方式 A：通过 Apexo Plugins 安装（官方推荐，Desktop 与 CLI 通用）

#### 1. CLI 一键固定版本安装
```bash
# 按 Git 标签固定版本安装 cn-tender-review 插件包（内嵌 cn-tender-review skill）
apexo plugins install --source cluster1900/apexo-skills@v0.1.0#skills/cn-tender-review --trust

# 查看已安装插件与内嵌 skill
apexo plugins details 'custom:cn-tender-review'
```

也可以将整个 `apexo-skills` 仓库添加为插件来源目录：
```bash
apexo plugins add-source https://github.com/cluster1900/apexo-skills.git
apexo plugins refresh
apexo plugins install 'apexo-skills:cn-tender-review' --trust
```

#### 2. Desktop（桌面端）图形界面安装
1. 打开 Apexo Desktop，点击左侧栏 **Plugins（插件）**（或按 `Cmd+K` / `Ctrl+K` 搜索 `Plugins`，或进入 **设置 → Plugins**）。
2. **直接安装单个技能**：点击右上角 **「自行安装」**，填入：
   ```text
   cluster1900/apexo-skills@v0.1.0#skills/cn-tender-review
   ```
   确认信任后点击安装，若当前已有打开的项目，点击 **「应用到当前项目」** 即可生效。
3. **订阅整个技能源**：切换到 **「来源」** 标签页，添加 `https://github.com/cluster1900/apexo-skills.git`，即可在「发现」页浏览并一键安装、升级或卸载。

---

### 方式 B：通过 GitHub Release 压缩包或本地目录安装（离线可用）

1. 前往本仓库 [Releases](https://github.com/cluster1900/apexo-skills/releases) 下载对应版本的 `cn-tender-review-v0.1.0.zip` 与 `SHA256SUMS`。
2. 校验哈希并解压到项目级 `.apexo/skills/cn-tender-review` 或全局 `~/.config/apexo/skills/cn-tender-review`：
   ```bash
   shasum -a 256 -c SHA256SUMS
   mkdir -p .apexo/skills/cn-tender-review
   unzip cn-tender-review-v0.1.0.zip -d .apexo/skills/cn-tender-review
   ```
   （或者解压到任意目录后，在 Desktop **Plugins → 自行安装** 中选择该解压目录）。

---

### 方式 C：通过 `apexo.json` 的 `skills.urls` / `skills.paths` 配置加载

在项目 `.apexo/apexo.json` 或全局 `~/.config/apexo/apexo.json` 中配置：

```json
{
  "skills": {
    "urls": [
      "https://raw.githubusercontent.com/cluster1900/apexo-skills/v0.1.0/skills/"
    ]
  }
}
```
配置后重启会话或执行技能重载，Apexo 会自动读取 `skills/index.json` 并缓存 `cn-tender-review` 及其全部 `references/` 文件。

---

### 卸载与禁用

```bash
# 禁用或卸载已安装的插件包
apexo plugins disable '<完整插件 ID>'
apexo plugins uninstall '<完整插件 ID>'
```
若采用 `.apexo/skills/cn-tender-review` 本地目录或 `skills.urls` 方式，删除对应目录或配置项并刷新会话即可移除。

---

## `cn-tender-review` 使用方法与规则概览

安装完成后，在 Apexo 会话中直接上传或指定工作区内的招标文件（支持 `.pdf`、`.docx`、`.txt`、`.md`）：

```text
请使用 cn-tender-review 技能审核这份招标文件：./招标文件-智慧园区弱电工程.pdf
```

### 核心审查维度与法定红线

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

---

## 本地校验与样例回归测试

`skills/cn-tender-review/examples/` 内置 4 套脱敏基准样例（`S1` 合规基线、`S2` 时限违规、`S3` 歧视条款+3%保证金、`S4` 政府采购口径违规）及期望 Finding 断言：

```bash
# 运行全部规则覆盖率、扫描件降级与 S1~S4 样例回归测试（纯本地只读，无网络请求）
node skills/cn-tender-review/scripts/verify-examples.mjs

# 对指定文本/Markdown 招标文件执行本地规则预检并输出 JSON 报告
node skills/cn-tender-review/scripts/verify-examples.mjs --audit skills/cn-tender-review/examples/S3-discriminatory-and-bond-3pct.md
```

---

## 开源协议

MIT License
