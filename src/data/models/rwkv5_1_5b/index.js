// RWKV-5 1.5B: efficient small model
// Released: July 2023
// Source: https://huggingface.co/BlinkDL/rwkv-5-world-1b5
export default {
  id: 'rwkv5_1_5b',
  released: '2023-07',
  name: 'RWKV-5 World 1.5B',
  type: 'dense',
  params: 1.5,
  layers: 24,
  kv_heads: 1,
  head_dim: 128,
  hidden_size: 2048,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/BlinkDL/rwkv-5-world-1b5',
  },
}
