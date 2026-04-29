// Mamba 2.8B: SSM architecture model
// Released: December 2023
// Source: https://huggingface.co/state-spaces/mamba-2.8b
export default {
  id: 'mamba_2_8b',
  released: '2023-12',
  name: 'Mamba 2.8B',
  type: 'dense',
  params: 2.8,
  layers: 64,
  kv_heads: 1,
  head_dim: 128,
  hidden_size: 2560,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/state-spaces/mamba-2.8b',
  },
}
