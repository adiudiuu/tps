// RWKV-5 3B: compact RNN model
// Released: July 2023
// Source: https://huggingface.co/BlinkDL/rwkv-5-world-3b
export default {
  id: 'rwkv5_3b',
  released: '2023-07',
  name: 'RWKV-5 World 3B',
  type: 'dense',
  params: 3.0,
  layers: 32,
  kv_heads: 1,
  head_dim: 128,
  hidden_size: 2560,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/BlinkDL/rwkv-5-world-3b',
  },
}
