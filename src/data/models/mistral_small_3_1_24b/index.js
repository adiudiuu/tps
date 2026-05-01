// Mistral Small 3.1 24B: multimodal update to Mistral Small 3, 128K ctx
// Source: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
export default {
  id: 'mistral_small_3_1_24b',
  released: '2025-03',
  name: 'Mistral Small 3.1 24B',
  type: 'dense',
  params: 24.0,
  layers: 40,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503',
    ollama: 'ollama pull mistral-small3.1',
  },
}
