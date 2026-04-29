// Qwen3 Coder Next 80B: MoE with 3B active parameters
// 80B total params, 3B active per token, designed for coding agents
// Source: https://huggingface.co/Qwen/qwen3-coder-next
export default {
  id: 'qwen3_coder_next_80b',
  released: '2025-01',
  name: 'Qwen3 Coder Next 80B',
  type: 'moe',
  params: 80,
  active_params: 3,
  experts: 64,
  experts_per_token: 2,
  layers: 28,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 1536,
  max_ctx: 32768,
  links: {
    ollama: null,
    hf: 'https://huggingface.co/Qwen/qwen3-coder-next',
    ms: 'https://modelscope.cn/models/qwen/qwen3-coder-next'
  }
}
