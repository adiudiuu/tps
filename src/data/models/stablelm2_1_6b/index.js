// StableLM 2 1.6B: efficient second generation
// Released: January 2024
// Source: https://huggingface.co/stabilityai/stablelm-2-1_6b
export default {
  id: 'stablelm2_1_6b',
  released: '2024-01',
  name: 'StableLM 2 1.6B',
  type: 'dense',
  params: 1.6,
  layers: 24,
  kv_heads: 32,
  head_dim: 64,
  hidden_size: 2048,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/stabilityai/stablelm-2-1_6b',
  },
}
