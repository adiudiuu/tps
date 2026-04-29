// StableLM 2 12B: larger second generation
// Released: January 2024
// Source: https://huggingface.co/stabilityai/stablelm-2-12b
export default {
  id: 'stablelm2_12b',
  released: '2024-01',
  name: 'StableLM 2 12B',
  type: 'dense',
  params: 12.0,
  layers: 40,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/stabilityai/stablelm-2-12b',
  },
}
