// DeepSeek-VL 7B: vision-language model
// Released: March 2024
// Source: https://huggingface.co/deepseek-ai/deepseek-vl-7b-base
export default {
  id: 'deepseek_vl_7b',
  released: '2024-03',
  name: 'DeepSeek-VL 7B',
  type: 'dense',
  params: 7.0,
  layers: 30,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/deepseek-ai/deepseek-vl-7b-base',
    ms: 'https://modelscope.cn/models/deepseek-ai/deepseek-vl-7b-base',
  },
}
