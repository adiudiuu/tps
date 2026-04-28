// Ministral 3 3B (dense model)
// Source: https://mistral.ai/news/mistral-3/
export default {
  id: 'ministral_3_3b',
  released: '2025-12',
  name: 'Ministral 3 (3B)',
  type: 'dense',
  params: 3,
  layers: 26,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 3072,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull ministral:3b',
    hf: 'https://huggingface.co/mistralai/Ministral-3-3B',
  },
}
