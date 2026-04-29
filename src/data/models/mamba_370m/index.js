// Mamba 370M: small efficient SSM model
// Released: December 2023
// Source: https://huggingface.co/state-spaces/mamba-370m
export default {
  id: 'mamba_370m',
  released: '2023-12',
  name: 'Mamba 370M',
  type: 'dense',
  params: 0.37,
  layers: 48,
  kv_heads: 1,
  head_dim: 128,
  hidden_size: 1024,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/state-spaces/mamba-370m',
  },
}
