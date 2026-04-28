// Qwen3 235B MoE: 235B total / 22B active, 128 experts / 8 active, 94 layers
// Released: April 2025
// Source: https://huggingface.co/Qwen/Qwen3-235B-A22B
export default {
  id: 'qwen3_235b',
  name: 'Qwen3 235B A22B (MoE)',
  type: 'moe',
  params: 235,
  active_params: 22,
  mla_ratio: null,
  layers: 94,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 262144,
  released: '2025-04',
  links: {
    ollama: 'ollama pull qwen3:235b',
    hf: 'https://huggingface.co/Qwen/Qwen3-235B-A22B',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3-235B-A22B',
  },
}
