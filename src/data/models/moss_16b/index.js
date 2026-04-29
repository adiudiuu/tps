// MOSS 16B: Fudan University's conversational model
// Released: April 2023
// Source: https://huggingface.co/fnlp/moss-moon-003-sft
export default {
  id: 'moss_16b',
  released: '2023-04',
  name: 'MOSS 16B',
  type: 'dense',
  params: 16.0,
  layers: 34,
  kv_heads: 34,
  head_dim: 128,
  hidden_size: 6144,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/fnlp/moss-moon-003-sft',
    ms: 'https://modelscope.cn/models/fnlp/moss-moon-003-sft',
  },
}
