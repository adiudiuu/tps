// BLOOM 176B: largest multilingual open model
// Released: July 2022
// Source: https://huggingface.co/bigscience/bloom
export default {
  id: 'bloom_176b',
  released: '2022-07',
  name: 'BLOOM 176B',
  type: 'dense',
  params: 176.0,
  layers: 70,
  kv_heads: 112,
  head_dim: 128,
  hidden_size: 14336,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/bigscience/bloom',
  },
}
