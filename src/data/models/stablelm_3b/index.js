// StableLM 3B: compact base model
// Released: April 2023
// Source: https://huggingface.co/stabilityai/stablelm-base-alpha-3b
export default {
  id: 'stablelm_3b',
  released: '2023-04',
  name: 'StableLM 3B',
  type: 'dense',
  params: 3.0,
  layers: 16,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/stabilityai/stablelm-base-alpha-3b',
  },
}
