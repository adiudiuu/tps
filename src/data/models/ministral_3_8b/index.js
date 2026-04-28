// Ministral 3 8B (dense model)
// Source: https://mistral.ai/news/mistral-3/
export default {
  id: 'ministral_3_8b',
  released: '2025-12',
  name: 'Ministral 3 (8B)',
  type: 'dense',
  params: 8,
  layers: 34,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull ministral:8b',
    hf: 'https://huggingface.co/mistralai/Ministral-3-8B',
  },
}
