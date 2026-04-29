// Codestral 22B: dense, code-specific model by Mistral AI, 80+ languages, 32K ctx
// Source: https://huggingface.co/mistralai/Codestral-22B-v0.1
export default {
  id: 'codestral_22b',
  released: '2024-05',
  name: 'Codestral 22B',
  type: 'dense',
  params: 22,
  layers: 56,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 6144,
  max_ctx: 32768,
  links: {
    ollama: 'ollama pull codestral:22b',
    hf: 'https://huggingface.co/mistralai/Codestral-22B-v0.1',
  },
}
