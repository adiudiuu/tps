// Qwen3-VL-235B-A22B: multimodal MoE, 128 experts top-8, 94 layers, 256K context
// Source: https://huggingface.co/Qwen/Qwen3-VL-235B-A22B-Instruct/blob/main/config.json
export default {
  id: 'qwen3_vl_235b_a22b',
  name: 'Qwen3-VL-235B-A22B',
  type: 'moe',
  params: 235,
  active_params: 22,
  experts: 128,
  experts_per_token: 8,
  layers: 94,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 262144,
  tags: ['chat', 'multilingual', 'vision', 'multimodal'],
  // Qwen3-VL：patch 16 + spatial_merge 2 → 32× 压缩；官方 README 推荐单图预算 256–1280
  // Source: QwenLM/Qwen3-VL README + HF config vision_config / preprocessor_config
  vision_seq_tokens: 1280,
  released: '2025-09',
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen3-VL-235B-A22B-Instruct',
  },
}
