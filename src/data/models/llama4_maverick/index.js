// Llama 4 Maverick: 17Bx128E MoE, ~400B total, 1M context
// Released: April 5, 2025
// Source: https://huggingface.co/meta-llama/Llama-4-Maverick-17B-128E
// iRoPE 混合注意力：每 4 层 1 个 global full-attention，其余为 local sliding window
// local_layers = 36（48 × 3/4），sliding_window = 8192
export default {
  id: 'llama4_maverick',
  name: 'Llama 4 Maverick (17Bx128E)',
  type: 'moe',
  params: 400,
  active_params: 17,
  experts: 128,
  experts_per_token: 1,
  mla_ratio: null,
  layers: 48,
  local_layers: 36,       // iRoPE: 3/4 层为 local sliding window attention
  sliding_window: 8192,   // local 层的 KV 窗口大小
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 1048576,
  released: '2025-04',
  links: {
    ollama: 'ollama pull llama4:maverick',
    hf: 'https://huggingface.co/meta-llama/Llama-4-Maverick-17B-128E-Instruct',
    ms: 'https://modelscope.cn/models/LLM-Research/Llama-4-Maverick-17B-128E-Instruct',
  },
}
