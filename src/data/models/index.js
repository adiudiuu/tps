// src/data/models/index.js
// Models sorted by release date, newest first

import gpt_oss_120b from './gpt_oss_120b/index.js'
import gpt_oss_20b from './gpt_oss_20b/index.js'
import glm5_1 from './glm5_1/index.js'
import glm5 from './glm5/index.js'
import glm4_6 from './glm4_6/index.js'
import glm4_5 from './glm4_5/index.js'
import glm4_5_air from './glm4_5_air/index.js'
import glm4_32b from './glm4_32b/index.js'
import glm4_9b from './glm4_9b/index.js'
import minimax_m2_5 from './minimax_m2_5/index.js'
import minimax_m2_7 from './minimax_m2_7/index.js'
import kimi_k2_6 from './kimi_k2_6/index.js'
import kimi_k2_5 from './kimi_k2_5/index.js'
import kimi_k2_thinking from './kimi_k2_thinking/index.js'
import kimi_k2 from './kimi_k2/index.js'
import llama4_maverick from './llama4_maverick/index.js'
import llama4_scout from './llama4_scout/index.js'
import minimax_m1 from './minimax_m1/index.js'
import minimax_text_01 from './minimax_text_01/index.js'
import qwen35_27b from './qwen35_27b/index.js'
import qwen35_9b from './qwen35_9b/index.js'
import qwen35_4b from './qwen35_4b/index.js'
import qwen35_2b from './qwen35_2b/index.js'
import qwen35_35b_a3b from './qwen35_35b_a3b/index.js'
import qwen35_122b_a10b from './qwen35_122b_a10b/index.js'
import qwen35_397b_a17b from './qwen35_397b_a17b/index.js'
import qwen3_235b from './qwen3_235b/index.js'
import qwen3_32b from './qwen3_32b/index.js'
import qwen3_14b from './qwen3_14b/index.js'
import qwen3_8b from './qwen3_8b/index.js'
import qwen3_4b from './qwen3_4b/index.js'
import gemma4_31b from './gemma4_31b/index.js'
import gemma4_e4b from './gemma4_e4b/index.js'
import gemma4_e2b from './gemma4_e2b/index.js'
import gemma4_26b_moe from './gemma4_26b_moe/index.js'
import deepseek_r1 from './deepseek_r1/index.js'
import deepseek_v3 from './deepseek_v3/index.js'
import deepseek_v4_flash from './deepseek_v4_flash/index.js'
import deepseek_v4_pro from './deepseek_v4_pro/index.js'
import qwen3_6_27b from './qwen3_6_27b/index.js'
import qwen3_6_35b_a3b from './qwen3_6_35b_a3b/index.js'
import llama3_405b from './llama3_405b/index.js'
import llama3_3_70b from './llama3_3_70b/index.js'
import qwen2_72b from './qwen2_72b/index.js'
import llama3_70b from './llama3_70b/index.js'
import qwen25_32b from './qwen25_32b/index.js'
import qwen25_14b from './qwen25_14b/index.js'
import qwen2_7b from './qwen2_7b/index.js'
import gemma3_27b from './gemma3_27b/index.js'
import gemma3_12b from './gemma3_12b/index.js'
import gemma3_4b from './gemma3_4b/index.js'
import gemma3_1b from './gemma3_1b/index.js'
import gemma2_27b from './gemma2_27b/index.js'
import gemma2_9b from './gemma2_9b/index.js'
import deepseek_v2 from './deepseek_v2/index.js'
import mixtral_8x22b from './mixtral_8x22b/index.js'
import mistral_small_24b from './mistral_small_24b/index.js'
import phi4_14b from './phi4_14b/index.js'
import deepseek_r1_distill_llama_70b from './deepseek_r1_distill_llama_70b/index.js'
import deepseek_r1_distill_qwen_32b from './deepseek_r1_distill_qwen_32b/index.js'
import deepseek_r1_distill_qwen_14b from './deepseek_r1_distill_qwen_14b/index.js'
import deepseek_r1_distill_llama_8b from './deepseek_r1_distill_llama_8b/index.js'
import deepseek_r1_distill_qwen_7b from './deepseek_r1_distill_qwen_7b/index.js'
import llama3_8b from './llama3_8b/index.js'
import llama2_13b from './llama2_13b/index.js'
import tinyllama_1b from './tinyllama_1b/index.js'
import phi2_2b from './phi2_2b/index.js'
import mixtral_8x7b from './mixtral_8x7b/index.js'
import yi_34b from './yi_34b/index.js'
import falcon_180b from './falcon_180b/index.js'

export const DENSE_MODELS = [
  // 2026
  qwen35_27b,
  qwen35_9b,
  qwen35_4b,
  qwen35_2b,
  qwen3_6_27b,
  gemma4_31b,
  gemma4_e4b,
  gemma4_e2b,
  // 2025
  glm4_32b,
  glm4_9b,
  qwen3_32b,
  qwen3_14b,
  qwen3_8b,
  qwen3_4b,
  llama3_3_70b,
  gemma3_27b,
  gemma3_12b,
  gemma3_4b,
  gemma3_1b,
  mistral_small_24b,
  deepseek_r1_distill_llama_70b,
  deepseek_r1_distill_qwen_32b,
  deepseek_r1_distill_qwen_14b,
  deepseek_r1_distill_llama_8b,
  deepseek_r1_distill_qwen_7b,
  // 2024
  phi4_14b,
  llama3_405b,
  qwen2_72b,
  llama3_70b,
  qwen25_32b,
  qwen25_14b,
  qwen2_7b,
  gemma2_27b,
  gemma2_9b,
  llama3_8b,
  tinyllama_1b,
  phi2_2b,
  llama2_13b,
  yi_34b,
  falcon_180b,
]

export const MOE_MODELS = [
  // 2026
  glm5_1,
  glm5,
  minimax_m2_7,
  minimax_m2_5,
  kimi_k2_6,
  kimi_k2_5,
  deepseek_v4_pro,
  deepseek_v4_flash,
  qwen35_397b_a17b,
  qwen35_122b_a10b,
  qwen35_35b_a3b,
  qwen3_6_35b_a3b,
  gemma4_26b_moe,
  // 2025
  gpt_oss_120b,
  gpt_oss_20b,
  glm4_6,
  glm4_5,
  glm4_5_air,
  minimax_m1,
  llama4_maverick,
  llama4_scout,
  qwen3_235b,
  kimi_k2_thinking,
  kimi_k2,
  deepseek_r1,
  minimax_text_01,
  // 2024
  deepseek_v3,
  deepseek_v2,
  mixtral_8x22b,
  // 2023
  mixtral_8x7b,
]

export const ALL_MODELS = [...DENSE_MODELS, ...MOE_MODELS].sort((a, b) => {
  // Sort by released date descending (newest first)
  const [ay, am] = (a.released || '2000-01').split('-').map(Number)
  const [by, bm] = (b.released || '2000-01').split('-').map(Number)
  return by !== ay ? by - ay : bm - am
})
