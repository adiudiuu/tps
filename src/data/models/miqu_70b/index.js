// Miqu 70B: leaked Mistral model
// Released: January 2024
// Source: https://huggingface.co/miqudev/miqu-1-70b
export default {
  id: 'miqu_70b',
  released: '2024-01',
  name: 'Miqu 70B',
  type: 'dense',
  params: 70.0,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/miqudev/miqu-1-70b',
  },
}
