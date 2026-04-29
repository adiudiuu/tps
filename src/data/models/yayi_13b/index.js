// Yayi 13B: larger Wenge Technology model
// Released: December 2023
// Source: https://huggingface.co/wenge-research/yayi-13b
export default {
  id: 'yayi_13b',
  released: '2023-12',
  name: 'Yayi 13B',
  type: 'dense',
  params: 13.0,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/wenge-research/yayi-13b',
    ms: 'https://modelscope.cn/models/wenge-research/yayi-13b',
  },
}
