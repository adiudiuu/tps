// Amber 7B: fully open LLM360 model
// Released: December 2023
// Source: https://huggingface.co/LLM360/Amber
export default {
  id: 'amber_7b',
  released: '2023-12',
  name: 'Amber 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/LLM360/Amber',
  },
}
