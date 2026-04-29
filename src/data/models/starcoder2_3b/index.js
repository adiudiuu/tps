// StarCoder2 3B: dense, code-specific model, 17 languages, 16K ctx
// Source: https://huggingface.co/bigcode/starcoder2-3b
export default {
  id: 'starcoder2_3b',
  released: '2024-02',
  name: 'StarCoder2 3B',
  type: 'dense',
  params: 3,
  layers: 30,
  kv_heads: 2,
  head_dim: 64,
  hidden_size: 2304,
  max_ctx: 16384,
  links: {
    ollama: 'ollama pull starcoder2:3b',
    hf: 'https://huggingface.co/bigcode/starcoder2-3b',
  },
}
