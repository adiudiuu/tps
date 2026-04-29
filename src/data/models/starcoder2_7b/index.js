// StarCoder2 7B: dense, code-specific model, 17 languages, 16K ctx
// Source: https://huggingface.co/bigcode/starcoder2-7b
export default {
  id: 'starcoder2_7b',
  released: '2024-02',
  name: 'StarCoder2 7B',
  type: 'dense',
  params: 7,
  layers: 32,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 4608,
  max_ctx: 16384,
  links: {
    ollama: 'ollama pull starcoder2:7b',
    hf: 'https://huggingface.co/bigcode/starcoder2-7b',
  },
}
