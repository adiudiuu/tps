// BLOOM 3B: mid-size multilingual model
// Released: July 2022
// Source: https://huggingface.co/bigscience/bloom-3b
export default {
  id: 'bloom_3b',
  released: '2022-07',
  name: 'BLOOM 3B',
  type: 'dense',
  params: 3.0,
  layers: 30,
  kv_heads: 32,
  head_dim: 64,
  hidden_size: 2560,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/bigscience/bloom-3b',
  },
}
