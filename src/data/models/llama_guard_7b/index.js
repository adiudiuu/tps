// Llama Guard 7B: content safety model
// Released: December 2023
// Source: https://huggingface.co/meta-llama/LlamaGuard-7b
export default {
  id: 'llama_guard_7b',
  released: '2023-12',
  name: 'Llama Guard 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/meta-llama/LlamaGuard-7b',
  },
}
