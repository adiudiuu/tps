// Yayi 7B: Wenge Technology's Chinese model
// Released: November 2023
// Source: https://huggingface.co/wenge-research/yayi-7b
export default {
  id: 'yayi_7b',
  released: '2023-11',
  name: 'Yayi 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/wenge-research/yayi-7b',
    ms: 'https://modelscope.cn/models/wenge-research/yayi-7b',
  },
}
