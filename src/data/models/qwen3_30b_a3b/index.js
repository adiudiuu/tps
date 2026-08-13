// Qwen3-30B-A3B: 30B MoE / 3B active, 128 experts top-8, 48 layers
// Geometry from original Apr 2025 release; ctx from Instruct-2507 (262,144)
// Source: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507/blob/main/config.json
export default {
  id: 'qwen3_30b_a3b',
  name: 'Qwen3 30B-A3B',
  type: 'moe',
  params: 30,
  active_params: 3,
  experts: 128,
  experts_per_token: 8,
  layers: 48,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 2048,
  max_ctx: 262144,
  tags: ['chat', 'multilingual'],
  released: '2025-04',
  links: {
    ollama: 'ollama pull qwen3:30b-a3b',
    hf: 'https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3-30B-A3B-Instruct-2507',
  },
}
