// Mistral Large 3: 675B MoE with 41B active parameters
// Source: https://mistral.ai/news/mistral-3/
// HF mistralai/Mistral-Large-3 无公开 config.json（404）；experts=8/k=2 无法核验。
// calc 在 NE 公式为负时关闭 EP 分片节省，不猜专家数。
export default {
  id: 'mistral_large_3',
  released: '2025-12',
  name: 'Mistral Large 3 (675B MoE)',
  type: 'moe',
  params: 675,
  active_params: 41,
  experts: 8,
  experts_per_token: 2,
  layers: 88,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 14336,
  max_ctx: 262144,
  tags: ['chat'],
  links: {
    ollama: 'ollama pull mistral-large-3',
    hf: 'https://huggingface.co/mistralai/Mistral-Large-3',
  },
}
