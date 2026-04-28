// Ministral 3 14B (dense model)
// Source: https://mistral.ai/news/mistral-3/
export default {
  id: 'ministral_3_14b',
  released: '2025-12',
  name: 'Ministral 3 (14B)',
  type: 'dense',
  params: 14,
  layers: 40,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull ministral:14b',
    hf: 'https://huggingface.co/mistralai/Ministral-3-14B',
  },
}
