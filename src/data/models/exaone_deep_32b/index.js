// EXAONE Deep 32B: LG AI Research large reasoning model
// Source: https://huggingface.co/LGAI-EXAONE/EXAONE-Deep-32B
export default {
  id: 'exaone_deep_32b',
  released: '2025-02',
  name: 'EXAONE Deep 32B',
  type: 'dense',
  params: 32.0,
  layers: 64,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/LGAI-EXAONE/EXAONE-Deep-32B',
    ollama: 'ollama pull exaone-deep:32b',
  },
}
