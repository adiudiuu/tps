// RWKV-6 3B: improved compact model
// Released: February 2024
// Source: https://huggingface.co/BlinkDL/rwkv-6-world-3b
export default {
  id: 'rwkv6_3b',
  released: '2024-02',
  name: 'RWKV-6 World 3B',
  type: 'dense',
  params: 3.0,
  layers: 32,
  kv_heads: 1,
  head_dim: 128,
  hidden_size: 2560,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/BlinkDL/rwkv-6-world-3b',
  },
}
