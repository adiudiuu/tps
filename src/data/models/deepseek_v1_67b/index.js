// DeepSeek V1 67B: first generation base model
// Released: November 2023
// Source: https://huggingface.co/deepseek-ai/deepseek-llm-67b-base
export default {
  id: 'deepseek_v1_67b',
  released: '2023-11',
  name: 'DeepSeek V1 67B',
  type: 'dense',
  params: 67.0,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/deepseek-ai/deepseek-llm-67b-base',
    ms: 'https://modelscope.cn/models/deepseek-ai/deepseek-llm-67b-base',
  },
}
