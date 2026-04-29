// Yi-VL 6B: vision-language model
// Released: January 2024
// Source: https://huggingface.co/01-ai/Yi-VL-6B
export default {
  id: 'yi_vl_6b',
  released: '2024-01',
  name: 'Yi-VL 6B',
  type: 'dense',
  params: 6.0,
  layers: 32,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/01-ai/Yi-VL-6B',
    ms: 'https://modelscope.cn/models/01ai/Yi-VL-6B',
  },
}
