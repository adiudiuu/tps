// Llama Guard 3 8B: improved safety model
// Released: July 2024
// Source: https://huggingface.co/meta-llama/Llama-Guard-3-8B
export default {
  id: 'llama_guard_3_8b',
  released: '2024-07',
  name: 'Llama Guard 3 8B',
  type: 'dense',
  params: 8.0,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/meta-llama/Llama-Guard-3-8B',
  },
}
