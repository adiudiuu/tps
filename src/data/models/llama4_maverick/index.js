// Llama 4 Maverick: 17Bx128E MoE, ~400B total, 1M context
// Released: April 5, 2025
// Source: https://huggingface.co/meta-llama/Llama-4-Maverick-17B-128E
export default {
  id: 'llama4_maverick',
  name: 'Llama 4 Maverick (17Bx128E)',
  type: 'moe',
  params: 400,
  active_params: 17,
  mla_ratio: null,
  layers: 48,
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
