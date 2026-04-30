// Qwen3-Coder 480B: MoE, 480B total / 35B active, agentic coding model, 256K ctx
// Source: https://huggingface.co/Qwen/Qwen3-Coder-480B-A35B-Instruct
export default {
  id: 'qwen3_coder_480b',
  released: '2025-07',
  name: 'Qwen3-Coder 480B',
  type: 'moe',
  params: 480,
  active_params: 35,
  experts: 160,
  experts_per_token: 8,
  layers: 80,
  kv_heads: 128,
  head_dim: 128,
  hidden_size: 7168,
  max_ctx: 262144,
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen3-Coder-480B-A35B-Instruct',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3-Coder-480B-A35B-Instruct',
  },
}
