// Falcon 11B: mid-size model
// Released: November 2023
// Source: https://huggingface.co/tiiuae/falcon-11B
export default {
  id: 'falcon_11b',
  released: '2023-11',
  name: 'Falcon 11B',
  type: 'dense',
  params: 11.0,
  layers: 60,
  kv_heads: 8,
  head_dim: 64,
  hidden_size: 4096,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/tiiuae/falcon-11B',
  },
}
