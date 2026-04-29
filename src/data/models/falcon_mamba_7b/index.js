// Falcon Mamba 7B: SSM architecture variant
// Released: March 2024
// Source: https://huggingface.co/tiiuae/falcon-mamba-7b
export default {
  id: 'falcon_mamba_7b',
  released: '2024-03',
  name: 'Falcon Mamba 7B',
  type: 'dense',
  params: 7.0,
  layers: 64,
  kv_heads: 1,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/tiiuae/falcon-mamba-7b',
  },
}
