// DeepSeek V1 7B: first generation small model
// Released: November 2023
// Source: https://huggingface.co/deepseek-ai/deepseek-llm-7b-base
export default {
  id: 'deepseek_v1_7b',
  released: '2023-11',
  name: 'DeepSeek V1 7B',
  type: 'dense',
  params: 7.0,
  layers: 30,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/deepseek-ai/deepseek-llm-7b-base',
    ms: 'https://modelscope.cn/models/deepseek-ai/deepseek-llm-7b-base',
  },
}
