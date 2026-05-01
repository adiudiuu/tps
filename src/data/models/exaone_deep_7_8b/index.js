// EXAONE Deep 7.8B: LG AI Research reasoning model
// Source: https://huggingface.co/LGAI-EXAONE/EXAONE-Deep-7.8B
export default {
  id: 'exaone_deep_7_8b',
  released: '2025-02',
  name: 'EXAONE Deep 7.8B',
  type: 'dense',
  params: 7.8,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/LGAI-EXAONE/EXAONE-Deep-7.8B',
    ollama: 'ollama pull exaone-deep:7.8b',
  },
}
