// Mamba 130M: ultra-compact SSM model
// Released: December 2023
// Source: https://huggingface.co/state-spaces/mamba-130m
export default {
  id: 'mamba_130m',
  released: '2023-12',
  name: 'Mamba 130M',
  type: 'dense',
  params: 0.13,
  layers: 24,
  kv_heads: 1,
  head_dim: 128,
  hidden_size: 768,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/state-spaces/mamba-130m',
  },
}
