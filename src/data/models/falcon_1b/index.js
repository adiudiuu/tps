// Falcon 1B: compact efficient model
// Released: September 2023
// Source: https://huggingface.co/tiiuae/falcon-rw-1b
export default {
  id: 'falcon_1b',
  released: '2023-09',
  name: 'Falcon 1B',
  type: 'dense',
  params: 1.0,
  layers: 24,
  kv_heads: 32,
  head_dim: 64,
  hidden_size: 2048,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/tiiuae/falcon-rw-1b',
  },
}
