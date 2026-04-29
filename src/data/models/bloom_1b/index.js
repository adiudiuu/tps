// BLOOM 1.1B: compact multilingual model
// Released: July 2022
// Source: https://huggingface.co/bigscience/bloom-1b1
export default {
  id: 'bloom_1b',
  released: '2022-07',
  name: 'BLOOM 1.1B',
  type: 'dense',
  params: 1.1,
  layers: 24,
  kv_heads: 16,
  head_dim: 64,
  hidden_size: 1536,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/bigscience/bloom-1b1',
  },
}
