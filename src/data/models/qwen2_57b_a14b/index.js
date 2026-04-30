// Qwen2 57B-A14B: MoE, 57.4B total / 14.3B active, 28 layers, 64K ctx
// Source: https://huggingface.co/Qwen/Qwen2-57B-A14B/blob/main/config.json
export default {
  id: 'qwen2_57b_a14b',
  released: '2024-06',
  name: 'Qwen2 57B-A14B',
  type: 'moe',
  params: 57.4,
  active_params: 14.3,
  experts: 64,
  experts_per_token: 8,
  mla_ratio: null,
  layers: 28,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 3584,
  max_ctx: 65536,
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen2-57B-A14B-Instruct',
    ms: 'https://modelscope.cn/models/Qwen/Qwen2-57B-A14B-Instruct',
    ollama: 'https://ollama.com/library/qwen2',
  },
}
