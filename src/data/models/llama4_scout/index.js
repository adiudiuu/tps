// Llama 4 Scout: 17Bx16E MoE, 109B total, 10M context
// Released: April 5, 2025
// Source: https://huggingface.co/meta-llama/Llama-4-Scout-17B-16E
export default {
  id: 'llama4_scout',
  name: 'Llama 4 Scout (17Bx16E)',
  type: 'moe',
  params: 109,
  active_params: 17,
  mla_ratio: null,
  layers: 48,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 10485760,
  released: '2025-04',
  links: {
    ollama: 'ollama pull llama4:scout',
    hf: 'https://huggingface.co/meta-llama/Llama-4-Scout-17B-16E-Instruct',
    ms: 'https://modelscope.cn/models/LLM-Research/Llama-4-Scout-17B-16E-Instruct',
  },
}
