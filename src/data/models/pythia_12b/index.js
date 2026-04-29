// Pythia 12B: largest EleutherAI research model
// Released: April 2023
// Source: https://huggingface.co/EleutherAI/pythia-12b
export default {
  id: 'pythia_12b',
  released: '2023-04',
  name: 'Pythia 12B',
  type: 'dense',
  params: 12.0,
  layers: 36,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/EleutherAI/pythia-12b',
  },
}
