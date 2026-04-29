// RWKV-6 7B: latest RNN architecture
// Released: February 2024
// Source: https://huggingface.co/BlinkDL/rwkv-6-world-7b
export default {
  id: 'rwkv6_7b',
  released: '2024-02',
  name: 'RWKV-6 World 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 1,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/BlinkDL/rwkv-6-world-7b',
  },
}
