# Changelog

All notable changes to `cn-tender-review` will be documented in this file.

## [0.1.0] - 2026-10-28

### Added

- Initial release (`v0.1.0`) of the `cn-tender-review` Agent Skill & Plugin bundle (`ruleset_version: 2026-10-28`).
- Coverage for 6 core audit categories (`TIME`, `BOND`/`FEE`, `DISC`, `EVAL`, `CONSIST`, `CONTRACT`) and scanned-PDF fallback (`SCAN-NO-TEXT-LAYER`).
- Statutory reference summaries for 《中华人民共和国招标投标法》, 《中华人民共和国招标投标法实施条例》, 《中华人民共和国政府采购法实施条例》, and 《政府采购货物和服务招标投标管理办法》（财政部令第 87 号）.
- Structured Markdown + JSON audit report template with mandatory legal disclaimer and data privacy notice.
- Four desensitized test examples (`S1` compliant baseline, `S2` timeline violations, `S3` discriminatory clauses & 3% bid bond, `S4` government procurement rules) with expected Finding ID assertions and local read-only verification script (`scripts/verify-examples.mjs`).
