// RWKV-5 7B: RNN-based efficient model
// Released: July 2023
// Source: https://huggingface.co/BlinkDL/rwkv-5-world-7b
export default {
  id: 'rwkv5_7b',
  released: '2023-07',
  name: 'RWKV-5 World 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 1,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/BlinkDL/rwkv-5-world-7b',
  },
}
