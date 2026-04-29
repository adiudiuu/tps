// Mamba 790M: compact SSM model
// Released: December 2023
// Source: https://huggingface.co/state-spaces/mamba-790m
export default {
  id: 'mamba_790m',
  released: '2023-12',
  name: 'Mamba 790M',
  type: 'dense',
  params: 0.79,
  layers: 48,
  kv_heads: 1,
  head_dim: 128,
  hidden_size: 1536,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/state-spaces/mamba-790m',
  },
}
