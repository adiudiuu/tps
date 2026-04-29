// DeepSeek Math 7B: math-specialized model
// Released: February 2024
// Source: https://huggingface.co/deepseek-ai/deepseek-math-7b-base
export default {
  id: 'deepseek_math_7b',
  released: '2024-02',
  name: 'DeepSeek Math 7B',
  type: 'dense',
  params: 7.0,
  layers: 30,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/deepseek-ai/deepseek-math-7b-base',
    ms: 'https://modelscope.cn/models/deepseek-ai/deepseek-math-7b-base',
  },
}
