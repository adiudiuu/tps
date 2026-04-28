---
name: model-data-validation
description: '抓取并验证 LLM 模型基础数据（released、params、links、MoE active_params）。Use when: 检查模型数据是否正确、校验发布时间、验证链接可用性、整理 src/data/models 结构。'
argument-hint: '输入要检查的范围，例如: 全量检查 / 只检查 Gemma4 / 修复 released 字段'
---

# Model Data Validation

## 何时使用

- 需要检查 `src/data/models/` 中模型数据是否符合当前结构
- 怀疑某些模型发布时间 `released` 错误
- 需要验证 `hf/ms` 链接可访问性
- 批量新增模型后，想做一次一致性检查

## 当前数据结构（项目约定）

每个模型文件位于 `src/data/models/<model-id>/index.js`，默认导出对象，核心字段：

- `id`, `name`, `type` (`dense` 或 `moe`)
- `params`, `layers`, `kv_heads`, `head_dim`, `hidden_size`, `max_ctx`
- `released`（格式必须为 `YYYY-MM`）
- `links`（建议至少有 `ollama` / `hf` / `ms` 之一）
- MoE 额外要求：`active_params`，且不大于 `params`

## 验证流程

1. 先做结构校验：
   - 运行 `npm run models:validate`
   - 校验字段、类型、`released` 格式、`id` 与文件夹名一致性、索引收录、排序一致性
2. 再做来源抓取校验：
   - 运行 `npm run models:verify-sources`
   - 验证 `hf/ms` 链接是否可访问
3. 如有失败项，按报告中的 `id` 回到对应模型文件修复
4. 修复后重复步骤 1 和 2，直到无错误

## 脚本

- 结构校验脚本：`./scripts/validate-model-data.mjs`
- 抓取验证脚本：`./scripts/verify-model-sources.mjs`

## 输出约定

- 所有脚本输出 JSON 报告
- 成功：退出码 `0`
- 失败：退出码 `1`，并输出失败详情（便于自动化流水线使用）
