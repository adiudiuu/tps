// Mamba 1.4B: mid-size SSM model
// Released: December 2023
// Source: https://huggingface.co/state-spaces/mamba-1.4b
export default {
  id: 'mamba_1_4b',
  released: '2023-12',
  name: 'Mamba 1.4B',
  type: 'dense',
  params: 1.4,
  layers: 48,
  kv_heads: 1,
  head_dim: 128,
  hidden_size: 2048,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/state-spaces/mamba-1.4b',
  },
}
