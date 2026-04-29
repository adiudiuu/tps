// Mistral 7B: dense, sliding window attention, 32K ctx
// Source: https://huggingface.co/mistralai/Mistral-7B-v0.3
export default {
  id: 'mistral_7b',
  released: '2023-09',
  name: 'Mistral 7B',
  type: 'dense',
  params: 7.3,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 32768,
  links: {
    ollama: 'ollama pull mistral',
    hf: 'https://huggingface.co/mistralai/Mistral-7B-v0.3',
  },
}
