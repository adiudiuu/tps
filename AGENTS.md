# AGENTS.md

本文件是 **TPS Calculator**（在线：[tps.bunai.cc](https://tps.bunai.cc)）的团队与 AI agent 统一维护指南。动笔改代码前请先读本文件，并**对照现网已有同类模块**再写，保持风格、命名与字段口径一致。

## 1. 项目概览与基础命令

- **技术栈**：Vue 3 + Vite + Tailwind 的纯前端 PWA，无后端。核心是给定 GPU、模型、量化与运行参数，估算显存占用、吞吐（TPS）、延迟（TTFT/TPOT）与瓶颈（Roofline）。
- **Node 版本**：锁定 `.node-version` = `22.16.0`。某些环境默认 `node` 未必是该版本，需先 `nvm use 22.16.0`（或 `nvm install 22.16.0`）再执行命令。
- **包管理**：用 npm。`.npmrc` 设了 `legacy-peer-deps=true` 与 `shamefully-hoist=true`；仓库**未提交 `package-lock.json`**，安装依赖统一用 `npm install`。
- **命令**（`package.json` 仅这三个，**无 lint、无测试脚本**）：
    - `npm run dev` — 本地开发服务器（默认 `5173`）
    - `npm run build` — 生产构建
    - `npm run preview` — 预览生产构建

## 2. 通用代码规范

- **换行一律 LF**，禁止 CRLF。`.gitattributes` 已强制（`* text=auto eol=lf`），`.editorconfig` 亦要求 `end_of_line = lf`、`insert_final_newline = true`、缩进 4 空格。
- **先看现网再动手**：新增内容前先阅读同类现有模块，沿用其结构、命名与字段口径，不要另起一套。
- **只写终稿**：未上线能力按最终形态写，不留中间产物、废弃字段或注释掉的旧代码。
- **提交粒度**：每个逻辑改动一个 commit，commit message 清晰描述意图。

## 3. 新增模型 SOP（最高频维护项）

模型数据位于 `src/data/models/<id>/index.js`（默认导出一个对象），并在 `src/data/models/index.js` 注册。动笔前请对照现有条目（如 `glm5_3`、`glm5_3_flash`、`qwen38_flash_next`、`deepseek_v4_pro`、`deepseek_v4_flash_vision_exp`、`gemma4_26b_moe`、`ling3_flash_vl`、`hy3`、`muse_glimmer_30b` 等）核实后再写。

### 3.1 文件头注释

标注 **config.json 来源链接**与关键几何（层数、hidden、注意力头、专家数等），以及任何与营销口径的差异说明，便于后续核对。

### 3.2 常用字段

- 通用：`id` / `name` / `type`（`'moe'` | `'dense'`）/ `params` / `active_params` / `layers` / `kv_heads` / `head_dim` / `hidden_size` / `max_ctx` / `tags` / `released`（`'YYYY-MM'`）/ `links{ hf, ms }`。
- MoE 额外：`experts` / `experts_per_token` / `moe_execution`。

### 3.3 上下文 `max_ctx`

以 config.json 原生 `max_position_embeddings` 为准，**不取营销 / YaRN 扩展值**。官方宣称的更大上下文写进文件头注释即可。
例：`ling3_flash_vl` config 为 `131072`（官方宣称 256K），取 `131072` 并注释。

### 3.4 MLA / DSA 的 KV 压缩：`mla_ratio`

口径为：`mla_ratio = (kv_lora_rank + qk_rope_head_dim) / (2 × kv_heads × head_dim)`，其中 `kv_heads` / `head_dim` 取 config 的 `num_key_value_heads` / `head_dim`（或按 latent KV 维度口径，见 `deepseek_v4_pro` 注释）。现网真实示例：

- `glm5_3`：每 token 每层缓存 `512 + 64 = 576`，基线 `2 × 64 × 192 = 24576` → `mla_ratio = 576 / 24576 ≈ 0.0234`。
- `deepseek_v4_pro`：`head_dim=512` 为 latent KV 维度，缓存 `512 + 64 = 576`，基线 `2 × 1 × 512 = 1024` → `mla_ratio = 0.5625`；因 `hidden/head_dim` 推不出 Q 头数，显式写 `query_heads: 128`。
- 无 MLA 的模型置 `mla_ratio: null`（见 `gemma4_26b_moe`）。

### 3.5 线性注意力层

GatedDeltaNet / KDA 等不占标准 KV 的层，用 `linear_attention_layers` 记数，并配 `local_layers`（同值）+ `sliding_window: 0`。例见 `qwen38_flash_next`（36 GDN）、`glm5_3_flash`（34 KDA）、`ling3_flash_vl`（35 KDA）。

> `calc.js` 约定：`linear_attention_layers`，或 `local_layers` 且 `sliding_window === 0`，都视为「不占标准 KV」；`sliding_window > 0` 的 `local_layers` 仍按滑动窗计 KV（Gemma 3 / GPT-OSS 等）。

### 3.6 `query_heads`

当 `hidden_size / head_dim` 推不出 Q 头数（Q 投影升维，如 DeepSeek-V4 / MiMo / Step-3.5）时，显式写 `query_heads`（见 `model.js` 的 `getTotalHeads`）。

### 3.7 视觉字段

`vision_encoder_params` / `vision_seq_tokens` / `vision_encoder_in_params` 按**各模型自身 vision config** 估算，不要借用别家模型近似值。`vision_encoder_in_params: true` 表示总参数已含视觉编码器（`calc.js` 不再重复叠加）。本计算器不建模的模态（如音频）只在 `tags` 标注、不建模。

### 3.8 `tags`

只用现网已存在的标签，不要生造新标签（i18n 对未知标签走 fallback）。现有条目使用的标签集合：`chat` / `coding`（部分老条目用 `code`）/ `reasoning` / `vision` / `multimodal` / `multilingual` / `agentic` / `math` / `audio` / `medical` / `translation` / `hybrid`。Library 页筛选按钮识别 `chat` / `code` / `reasoning` / `vision` / `math` / `multilingual`。

### 3.9 `links` 校验

`links.hf` / `links.ms` 必须真实可达，提交前用 `curl -sI <url>` 确认返回 200。

### 3.10 注册

在 `src/data/models/index.js` 顶部 `import`，并加入对应数组：`MOE_MODELS` / `DENSE_MODELS` / `COMMUNITY_MODELS`（社区微调条目）。**每个数组内按 `released` 发布日期倒序（最新在前）**，并保持既有的年份分隔注释。

### 3.11 冒烟验证

写一次性 node 脚本，`import { ALL_MODELS }`（`src/data/models/index.js`）与 `calcAll`（`src/utils/calc.js`），在典型 GPU 配置下确认新模型 VRAM / TPS 为有限值（无 `NaN` / `Inf`）、MoE 非专家参数为正。验证后删除脚本。

## 4. i18n

- 语言文件在 `src/i18n/`，共 **7 个**：`zh.js`、`zh-TW.js`、`en.js`、`es.js`、`ja.js`、`ko.js`、`ru.js`。
- 新增任何 UI 文案，**7 个语言全部补齐**，沿用现有 key 层级与命名风格；勿只改中文。

## 5. 数据快照时间戳

- **单一真源**：`src/data/appMeta.js` 的 `UPDATED_AT_BEIJING`，格式 `YYYY/MM/DD HH:MM`（北京时间；`Header.vue` 按浏览器本地时区渲染）。
- 更新它时，需**同步** `public/llms*.txt`（7 个语言文件）里硬编码的同一日期（形如 `2026-09-10`），保持一致。
- SEO 月份粒度会自动从该值派生（见 `src/data/seoHighlights.js` 的 `SEO_UPDATED_MONTH`），无需手改。

## 6. 验证与测试约定

- 任何改动后至少确保 `npm run build` 通过。
- UI 改动要在浏览器实测（`npm run dev`，`5173`）。
- 与 `calc.js` / `model.js` 相关的改动做 node 冒烟（见 3.11），确认结果为有限值。
