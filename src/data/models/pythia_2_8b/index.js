// Pythia 2.8B: mid-size research model
// Released: April 2023
// Source: https://huggingface.co/EleutherAI/pythia-2.8b
export default {
  id: 'pythia_2_8b',
  released: '2023-04',
  name: 'Pythia 2.8B',
  type: 'dense',
  params: 2.8,
  layers: 32,
  kv_heads: 32,
  head_dim: 64,
  hidden_size: 2560,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/EleutherAI/pythia-2.8b',
  },
}
