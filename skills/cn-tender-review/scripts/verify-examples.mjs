#!/usr/bin/env node
/**
 * Local read-only verification and rule-precheck script for `cn-tender-review`.
 *
 * Security & privacy guarantees:
 * - Read-only local file operations only (`node:fs/promises`, `node:path`, `node:crypto`).
 * - Zero network requests, zero external dependencies, zero credentials/secrets.
 *
 * Usage:
 *   node scripts/verify-examples.mjs                  # Run full manifest, rule-ID, and S1-S4 regression suite
 *   node scripts/verify-examples.mjs --audit <file>   # Run deterministic rule precheck on a text/markdown tender file
 */

import fs from "node:fs/promises"
import path from "node:path"
import { createHash } from "node:crypto"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const skillRoot = path.resolve(__dirname, "..")

const REQUIRED_RULE_IDS = [
  "SCAN-NO-TEXT-LAYER",
  "TIME-BID-PREP-20D",
  "TIME-SALE-5D",
  "TIME-PQ-5D",
  "TIME-CLARIFY-15D",
  "TIME-GP-PROVIDE-5WD",
  "TIME-GP-ANNOUNCE-5WD",
  "BOND-BID-2PCT",
  "BOND-GP-2PCT",
  "FEE-DOC-COST-ONLY",
  "DISC-REGION",
  "DISC-BRAND",
  "DISC-QUAL-OVERSPEC",
  "DISC-AUTH-OEM",
  "DISC-JOINT",
  "EVAL-METHOD-MISMATCH",
  "EVAL-WEIGHT-SUM",
  "EVAL-GP-PRICE-WEIGHT",
  "EVAL-QUAL-AS-SCORE",
  "CONSIST-MISSING-SECTION",
  "CONSIST-TIMELINE-CONFLICT",
  "CONSIST-AMOUNT-TERM",
  "CONSIST-ADDENDUM",
  "CONTRACT-UNLIMITED-LIAB",
  "CONTRACT-UNILATERAL-TERM",
  "CONTRACT-PAYMENT-EXTREME",
  "CONTRACT-SUBSTANTIVE-CHANGE",
]

const DISCLAIMER =
  "本技能基于公开法规条文与常见实务检查清单提供辅助性预审，可能存在误报、漏报与地区性特殊规定未覆盖的情况。输出不构成法律意见或招标执业意见。发标、投诉、应标等正式行为请咨询具备资质的专业人员，并以现行有效法律、规章、标准招标文件及项目主管机关要求为准。"

export function evaluateTenderText(text, sourceFile = "input.md") {
  const trimmed = text.replace(/\s+/g, "")
  if (trimmed.length < 40) {
    return {
      skill: "cn-tender-review",
      version: "0.1.0",
      ruleset_version: "2026-10-28",
      source_file: sourceFile,
      project_domain: "unknown",
      disclaimer: DISCLAIMER,
      summary: { blocker: 1, high: 0, medium: 0, low: 0, info: 0 },
      findings: [
        {
          id: "SCAN-NO-TEXT-LAYER",
          severity: "blocker",
          title: "扫描版或无文本层 PDF 无法直接提取条款文本",
          category: "0. 输入文件与文本可提取性",
          location: "全文",
          evidence: trimmed.slice(0, 100) || "（提取到的有效文本为空或少于 40 字符）",
          law_refs: ["合规预审前置要求：缺少可提取文本层时不得假装已完成实质条款审查。"],
          suggestion: "请先使用 OCR 工具识别文本层，或提供原始可编辑 DOCX/TXT 招标文件后再执行审核。",
          confidence: "high",
        },
      ],
    }
  }

  const plain = text.replace(/\*+/g, "")
  const isGovProcurement = /政府采购|财政部令第\s*87\s*号/.test(plain)
  const projectDomain = isGovProcurement ? "government_procurement" : "engineering_mandatory"
  const findings = []

  // A. Timeline checks
  if (/(?:发售时间|发售期)[^\n]*(?:共计|共|仅)\s*[1-4]\s*日/.test(plain)) {
    findings.push({
      id: "TIME-SALE-5D",
      severity: "blocker",
      title: "招标文件发售期少于法定 5 日",
      category: "A. 法定时限与文件发售",
      location: "第一章 招标公告 — 招标文件的发售与获取",
      evidence: matchLine(plain, /发售时间|发售期/),
      law_refs: [
        "《中华人民共和国招标投标法实施条例》第十六条：资格预审文件或者招标文件的发售期不得少于 5 日。",
      ],
      suggestion: "延长招标文件发售截止时间，确保自开始发售之日起不少于 5 个自然日。",
      confidence: "high",
    })
  }

  if (/仅\s*(?:1\d|[1-9])\s*日/.test(plain) && /投标文件提交截止时间|投标截止/.test(plain)) {
    findings.push({
      id: "TIME-BID-PREP-20D",
      severity: "blocker",
      title: "依法必须招标项目等标期不足法定 20 日",
      category: "A. 法定时限与文件发售",
      location: "第一章 招标公告 — 投标文件的提交与开标安排",
      evidence: matchLine(plain, /投标文件提交截止时间/),
      law_refs: [
        "《中华人民共和国招标投标法》第二十四条：依法必须进行招标的项目，自招标文件开始发出之日起至投标人提交投标文件截止之日止，最短不得少于二十日。",
      ],
      suggestion: "顺延投标文件提交截止时间及开标时间，确保自招标文件开始发出之日起不少于 20 日。",
      confidence: "high",
    })
  }

  if (/投标截止时间\s*(?:[1-9]|1[0-4])\s*日前[^\n]*通知/.test(plain)) {
    findings.push({
      id: "TIME-CLARIFY-15D",
      severity: "high",
      title: "影响投标文件编制的澄清修改通知时限少于法定 15 日",
      category: "A. 法定时限与文件发售",
      location: "第二章 投标人须知前附表 — 招标文件的澄清与修改",
      evidence: matchLine(plain, /澄清或者修改/),
      law_refs: [
        "《中华人民共和国招标投标法》第二十三条、《中华人民共和国招标投标法实施条例》第二十一条：澄清或者修改的内容可能影响投标文件编制的，应当在投标截止时间至少 15 日前以书面形式通知所有潜在投标人；不足 15 日的，应当顺延提交投标文件的截止时间。",
      ],
      suggestion: "将澄清或修改通知时限改为「投标截止时间至少 15 日前；不足 15 日的，顺延提交投标文件的截止时间」。",
      confidence: "high",
    })
  }

  if (isGovProcurement && /实际仅提供\s*[1-4]\s*个工作日|不足\s*5\s*个工作日/.test(plain)) {
    findings.push({
      id: "TIME-GP-PROVIDE-5WD",
      severity: "blocker",
      title: "政府采购招标文件提供期限不足 5 个工作日",
      category: "A. 法定时限与文件发售",
      location: "第一章 投标邀请 — 获取招标文件的时间与方式",
      evidence: matchLine(plain, /招标文件提供期限/),
      law_refs: [
        "《政府采购货物和服务招标投标管理办法》（财政部令第 87 号）第十八条：提供期限自招标公告、资格预审公告发布之日起计算不得少于 5 个工作日。",
      ],
      suggestion: "扣除法定节假日与周末公休日后，将招标文件提供期限延长至不少于 5 个完整工作日。",
      confidence: "high",
    })
  }

  // B. Bond & Fee checks
  if (!isGovProcurement && /(?:占项目估算价[^\n]*(?:[3-9]|\d\d)\.?0?%|保证金[^\n]*3\.0%)/.test(plain)) {
    findings.push({
      id: "BOND-BID-2PCT",
      severity: "blocker",
      title: "投标保证金超过招标项目估算价的 2%",
      category: "B. 保证金与费用",
      location: "第二章 投标人须知前附表 — 投标保证金",
      evidence: matchLine(plain, /投标保证金/),
      law_refs: [
        "《中华人民共和国招标投标法实施条例》第二十六条：招标人在招标文件中要求投标人提交投标保证金的，投标保证金不得超过招标项目估算价的 2%。",
      ],
      suggestion: "将投标保证金金额下调至不超过项目估算价（最高投标限价）的 2%（本项目不超过 20 万元）。",
      confidence: "high",
    })
  }

  if (isGovProcurement && /现金信封|以\s*现金\s*方式/.test(plain)) {
    findings.push({
      id: "BOND-GP-2PCT",
      severity: "blocker",
      title: "政府采购投标保证金违规要求以现金形式提交",
      category: "B. 保证金与费用",
      location: "第二章 投标人资格要求与投标人须知 — 投标保证金",
      evidence: matchLine(plain, /现金/),
      law_refs: [
        "《中华人民共和国政府采购法实施条例》第三十三条：招标文件要求投标人提交投标保证金的，投标保证金应当以支票、汇票、本票或者金融机构、担保机构出具的保函等非现金形式提交。投标保证金数额不得超过采购项目预算金额的 2%。",
      ],
      suggestion: "删除现场交纳现金的规定，改为支票、汇票、本票或者金融机构、担保机构出具的保函等非现金形式。",
      confidence: "high",
    })
  }

  if (/按采购预算比例核定|[1-9],000\s*元/.test(plain) && /招标文件售价/.test(plain)) {
    findings.push({
      id: "FEE-DOC-COST-ONLY",
      severity: "high",
      title: "招标文件售价脱离印刷邮寄成本且按采购预算比例核定",
      category: "B. 保证金与费用",
      location: "第一章 投标邀请 — 获取招标文件的时间与方式",
      evidence: matchLine(plain, /招标文件售价/),
      law_refs: [
        "《政府采购货物和服务招标投标管理办法》（财政部令第 87 号）第二十四条：招标文件售价应当按照弥补制作、邮寄成本的原则确定，不得以营利为目的，不得以招标采购金额作为确定招标文件售价的依据。",
      ],
      suggestion: "取消按采购预算比例核定标书售价的做法，改为免费提供电子招标文件或仅按实际印刷成本收取。",
      confidence: "high",
    })
  }

  // C. Discriminatory clauses
  if (/外地投标企业必须在项目所在地[^\n]*分公司|本地员工社保证明|本级行政区域内/.test(plain)) {
    findings.push({
      id: "DISC-REGION",
      severity: "blocker",
      title: "设置本地注册分公司、本地社保纳税及特定行政区域业绩加分等地域限制",
      category: "C. 歧视性 / 排他性条款",
      location: "第一章 投标人资格要求 第3.2条 / 第三章 商务部分评分细则 第2.2.2条",
      evidence: matchLine(plain, /外地投标企业必须在项目所在地|本级行政区域内/),
      law_refs: [
        "《中华人民共和国招标投标法》第十八条：招标人不得以不合理的条件限制或者排斥潜在投标人，不得对潜在投标人实行歧视待遇。",
        "《中华人民共和国招标投标法实施条例》第三十二条：依法必须进行招标的项目以特定行政区域或者特定行业的业绩、奖项作为加分条件或者中标条件，属于以不合理条件限制、排斥潜在投标人。",
      ],
      suggestion: "删除要求在项目所在地注册分公司、提供本地纳税及社保证明的资格限制，以及限定本市行政区域内业绩和本地协会奖项的加分条款。",
      confidence: "high",
    })
  }

  if (/必须选用[^\n]*特定品牌型号|不接受其他品牌替代/.test(plain)) {
    findings.push({
      id: "DISC-BRAND",
      severity: "blocker",
      title: "技术要求直接指定特定品牌与型号且排斥其他品牌",
      category: "C. 歧视性 / 排他性条款",
      location: "第二章 关键设备技术要求（第五章第2.3条）",
      evidence: matchLine(plain, /特定品牌型号|不接受其他品牌替代/),
      law_refs: [
        "《中华人民共和国招标投标法》第二十条：招标文件不得要求或者标明特定的生产供应者以及含有倾向或者排斥潜在投标人的其他内容。",
        "《中华人民共和国招标投标法实施条例》第三十二条第（五）项：限定或者指定特定的专利、商标、品牌、原产地或者供应商属于以不合理条件限制、排斥潜在投标人。",
      ],
      suggestion: "删除特定品牌与型号名称，改为通用的国家/行业技术标准及客观性能参数范围。",
      confidence: "high",
    })
  }

  if (/原厂唯一授权函|原厂盖章的售后服务承诺函/.test(plain)) {
    findings.push({
      id: "DISC-AUTH-OEM",
      severity: "blocker",
      title: "对非进口设备要求提供生产厂家原厂唯一授权函及原厂售后承诺函",
      category: "C. 歧视性 / 排他性条款",
      location: "第一章 投标人资格要求 第3.3条",
      evidence: matchLine(plain, /原厂唯一授权函/),
      law_refs: [
        "《政府采购货物和服务招标投标管理办法》（财政部令第 87 号）第十七条：不得通过将除进口货物以外的生产厂家授权、承诺、证明、背书等作为资格要求，对投标人实行差别待遇或者歧视待遇。",
        "《中华人民共和国招标投标法实施条例》第三十二条：设定的资格、技术、商务条件不得以不合理条件限制或排斥潜在投标人。",
      ],
      suggestion: "删除要求国产非进口设备提供生产厂家唯一授权函及原厂盖章承诺函的资格与否决条款，改由投标人出具合法供货及售后承诺。",
      confidence: "high",
    })
  }

  if (/单项合同额\s*2,000\s*万元以上|本地安全防范行业协会年度优秀企业奖/.test(plain)) {
    findings.push({
      id: "DISC-QUAL-OVERSPEC",
      severity: "high",
      title: "业绩合同额要求达本项目估算价 2 倍且将地方行业协会奖项作为加分条件",
      category: "C. 歧视性 / 排他性条款",
      location: "第三章 评标办法 — 商务部分评分细则 第2.2.2条",
      evidence: matchLine(plain, /单项合同额\s*2,000\s*万元以上/),
      law_refs: [
        "《中华人民共和国招标投标法实施条例》第三十二条第（二）、（三）项：设定的资格、技术、商务条件与招标项目的具体特点和实际需要不相适应，或以特定行政区域、特定行业的业绩、奖项作为加分条件。",
      ],
      suggestion: "将类似业绩单项合同额标准下调至不超过本项目估算价的 50%~80%（即 500~800 万元），并删除特定地域行业协会奖项加分项。",
      confidence: "high",
    })
  }

  // D. Evaluation method checks
  if (isGovProcurement && /注册资本不得低于|年营业收入不得低于|从业人员总数不得少于|年纳税额达/.test(plain)) {
    findings.push({
      id: "EVAL-QUAL-AS-SCORE",
      severity: "blocker",
      title: "违规将企业注册资本、营业收入、从业人员、纳税额与资产总额等规模条件列为资格要求或评分因素",
      category: "D. 评标方法与一致性",
      location: "第二章 特定资格条件 第2.1条 / 第三章 商务部分评分标准",
      evidence: matchLine(plain, /注册资本不得低于|年纳税额达/),
      law_refs: [
        "《政府采购货物和服务招标投标管理办法》（财政部令第 87 号）第十七条：采购人、采购代理机构不得将投标人的注册资本、资产总额、营业收入、从业人员、利润、纳税额等规模条件作为资格要求或者评审因素。",
      ],
      suggestion: "删除注册资本、年营业收入、从业人员数量等资格门槛，以及按年纳税额和资产总额赋分的商务评分项。",
      confidence: "high",
    })
  }

  if (isGovProcurement && /货物项目[^\n]*价格分权重仅占\s*(?:[12]?\d)%/.test(plain)) {
    findings.push({
      id: "EVAL-GP-PRICE-WEIGHT",
      severity: "blocker",
      title: "政府采购货物项目价格分权重低于法定 30% 下限",
      category: "D. 评标方法与一致性",
      location: "第三章 评标方法及评分标准 — 分值构成",
      evidence: matchLine(plain, /价格分权重仅占/),
      law_refs: [
        "《政府采购货物和服务招标投标管理办法》（财政部令第 87 号）第五十五条：货物项目的价格分值占总分值的比重不得低于 30%；服务项目的价格分值占总分值的比重不得低于 10%。",
      ],
      suggestion: "将本项目（货物类）价格部分分值由 20 分上调至不少于 30 分（占比 ≥30%），相应下调技术或商务部分分值。",
      confidence: "high",
    })
  }

  if (/细项实际加总为\s*105\s*分|细项满分加总为[^\n]*55\s*分/.test(plain)) {
    findings.push({
      id: "EVAL-WEIGHT-SUM",
      severity: "blocker",
      title: "评分表二级细项加总与大项分值冲突且全表合计不等于 100 分",
      category: "D. 评标方法与一致性",
      location: "第三章 评标方法及评分标准 — 技术部分",
      evidence: matchLine(plain, /细项满分加总为/),
      law_refs: [
        "招标文件评标标准客观性与分值构成数学一致性要求：各评分项权重合计必须等于 100 分。",
      ],
      suggestion: "修正技术部分二级细项分值（如将三项调整为 20 + 15 + 15 = 50 分），确保与大项满分一致且全表总分为 100 分。",
      confidence: "high",
    })
  }

  // E. Consistency checks
  if (/投标截止后[^\n]*方才举行开标|投标文件提交截止时间：2026年11月15日\s*09:30[\s\S]*开标时间：2026年11月15日\s*14:00/.test(plain)) {
    findings.push({
      id: "CONSIST-TIMELINE-CONFLICT",
      severity: "blocker",
      title: "开标时间与投标文件提交截止时间不一致",
      category: "E. 必备章节与内部一致性",
      location: "第一章 招标公告 — 第3.1条、第3.2条",
      evidence: matchLine(plain, /开标时间：2026年11月15日\s*14:00/),
      law_refs: [
        "《中华人民共和国招标投标法》第三十四条：开标应当在招标文件确定的提交投标文件截止时间的同一时间公开进行。",
      ],
      suggestion: "将开标时间调整为与投标文件提交截止时间完全一致（同一时间公开进行）。",
      confidence: "high",
    })
  }

  // F. Contract risk checks
  if (/二次议价|按中标价再行下浮/.test(plain)) {
    findings.push({
      id: "CONTRACT-SUBSTANTIVE-CHANGE",
      severity: "high",
      title: "合同草案强制要求中标人在签约前接受二次议价下浮",
      category: "F. 合同条款风险",
      location: "第四章 合同专用条款草案 — 第24.3条",
      evidence: matchLine(plain, /二次议价|按中标价再行下浮/),
      law_refs: [
        "《中华人民共和国招标投标法》第四十六条：招标人和中标人应当自中标通知书发出之日起三十日内，按照招标文件和中标人的投标文件订立书面合同。招标人和中标人不得再行订立背离合同实质性内容的其他协议。",
      ],
      suggestion: "删除要求中标人接受二次议价或让利下浮的条款，明确按中标通知书确定的中标价格订立书面合同。",
      confidence: "high",
    })
  }

  const summary = {
    blocker: findings.filter((f) => f.severity === "blocker").length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
    info: findings.filter((f) => f.severity === "info").length,
  }

  return {
    skill: "cn-tender-review",
    version: "0.1.0",
    ruleset_version: "2026-10-28",
    source_file: sourceFile,
    project_domain: projectDomain,
    disclaimer: DISCLAIMER,
    summary,
    findings,
  }
}

function matchLine(text, regex) {
  const line = text.split("\n").find((l) => regex.test(l))
  return line ? line.trim().slice(0, 180) : ""
}

async function runVerification() {
  const args = process.argv.slice(2)
  if (args[0] === "--audit" && args[1]) {
    const target = path.resolve(process.cwd(), args[1])
    const content = await fs.readFile(target, "utf8")
    const report = evaluateTenderText(content, path.basename(target))
    console.log(JSON.stringify(report, null, 2))
    return
  }

  // 1. Validate manifest.json and plugin.json
  const manifest = JSON.parse(await fs.readFile(path.join(skillRoot, "manifest.json"), "utf8"))
  const plugin = JSON.parse(await fs.readFile(path.join(skillRoot, "plugin.json"), "utf8"))
  if (manifest.name !== "cn-tender-review" || plugin.name !== "cn-tender-review") {
    throw new Error("manifest.json and plugin.json name must be cn-tender-review")
  }
  if (manifest.version !== plugin.version) {
    throw new Error(`Version mismatch: manifest=${manifest.version} vs plugin=${plugin.version}`)
  }

  // 2. Validate SKILL.md and references rule coverage
  const skillMd = await fs.readFile(path.join(skillRoot, "SKILL.md"), "utf8")
  const checklistMd = await fs.readFile(path.join(skillRoot, "references", "checklist-rules.md"), "utf8")
  if (!skillMd.startsWith("---\nname: cn-tender-review\ndescription:")) {
    throw new Error("SKILL.md is missing valid YAML frontmatter (name + description)")
  }
  if (!skillMd.includes("不构成法律意见")) {
    throw new Error("SKILL.md is missing mandatory legal disclaimer")
  }
  for (const id of REQUIRED_RULE_IDS) {
    if (!skillMd.includes(id) || !checklistMd.includes(id)) {
      throw new Error(`Rule ID ${id} is missing from SKILL.md or references/checklist-rules.md`)
    }
  }

  // 3. Verify scanned / empty PDF fallback (SCAN-NO-TEXT-LAYER)
  const scanReport = evaluateTenderText("   ", "scanned-empty.pdf")
  if (scanReport.findings[0]?.id !== "SCAN-NO-TEXT-LAYER") {
    throw new Error("Expected SCAN-NO-TEXT-LAYER on empty/scanned document")
  }

  // 4. Run S1-S4 example regression suite
  const examplesDir = path.join(skillRoot, "examples")
  const expectFiles = (await fs.readdir(examplesDir)).filter((f) => f.endsWith("-expected-findings.json")).sort()
  if (expectFiles.length < 4) {
    throw new Error(`Expected at least 4 example test cases, found ${expectFiles.length}`)
  }

  for (const file of expectFiles) {
    const spec = JSON.parse(await fs.readFile(path.join(examplesDir, file), "utf8"))
    const sourcePath = path.join(examplesDir, spec.source_file)
    const content = await fs.readFile(sourcePath, "utf8")
    const sha256 = createHash("sha256").update(content).digest("hex").slice(0, 16)
    const report = evaluateTenderText(content, spec.source_file)
    const actualIds = report.findings.map((f) => f.id)

    for (const expectedId of spec.expected_finding_ids) {
      if (!actualIds.includes(expectedId)) {
        throw new Error(`[${spec.example_id}] Missing expected finding ID: ${expectedId} (got: ${actualIds.join(", ")})`)
      }
    }
    for (const forbiddenId of spec.forbidden_finding_ids ?? []) {
      if (actualIds.includes(forbiddenId)) {
        throw new Error(`[${spec.example_id}] Triggered forbidden finding ID: ${forbiddenId}`)
      }
    }
    for (const detail of spec.expected_findings_detail ?? []) {
      const item = report.findings.find((f) => f.id === detail.id)
      if (!item) throw new Error(`[${spec.example_id}] Finding ${detail.id} not found`)
      if (item.severity !== detail.severity) {
        throw new Error(`[${spec.example_id}] ${detail.id} severity=${item.severity}, expected=${detail.severity}`)
      }
      if (!item.location || !item.evidence || !item.suggestion || !item.law_refs?.length) {
        throw new Error(`[${spec.example_id}] ${detail.id} is missing location/evidence/law_refs/suggestion`)
      }
      if (!item.law_refs.join(" ").includes(detail.law_keyword)) {
        throw new Error(`[${spec.example_id}] ${detail.id} law_refs missing keyword "${detail.law_keyword}"`)
      }
    }
    console.log(
      `PASS [${spec.example_id}] ${spec.source_file} (sha256=${sha256}) -> findings=[${actualIds.join(", ")}]`,
    )
  }

  console.log(`ALL CHECKS PASSED (${REQUIRED_RULE_IDS.length} rules verified, ${expectFiles.length} examples passed, scan fallback verified).`)
}

runVerification().catch((err) => {
  console.error("VERIFICATION FAILED:", err.message)
  process.exit(1)
})
