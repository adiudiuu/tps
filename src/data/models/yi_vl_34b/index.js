// Yi-VL 34B: large vision-language model
// Released: January 2024
// Source: https://huggingface.co/01-ai/Yi-VL-34B
export default {
  id: 'yi_vl_34b',
  released: '2024-01',
  name: 'Yi-VL 34B',
  type: 'dense',
  params: 34.0,
  layers: 60,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 7168,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/01-ai/Yi-VL-34B',
    ms: 'https://modelscope.cn/models/01ai/Yi-VL-34B',
  },
}
