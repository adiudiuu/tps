// Pythia 6.9B: research model with full training data
// Released: April 2023
// Source: https://huggingface.co/EleutherAI/pythia-6.9b
export default {
  id: 'pythia_6_9b',
  released: '2023-04',
  name: 'Pythia 6.9B',
  type: 'dense',
  params: 6.9,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/EleutherAI/pythia-6.9b',
  },
}
