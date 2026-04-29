// StarCoder2 15B: dense, code-specific model, 600+ languages, 16K ctx
// Source: https://huggingface.co/bigcode/starcoder2-15b
export default {
  id: 'starcoder2_15b',
  released: '2024-02',
  name: 'StarCoder2 15B',
  type: 'dense',
  params: 15,
  layers: 40,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 6144,
  max_ctx: 16384,
  links: {
    ollama: 'ollama pull starcoder2:15b',
    hf: 'https://huggingface.co/bigcode/starcoder2-15b',
  },
}
