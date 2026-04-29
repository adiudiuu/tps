// DeepSeek Coder 7B: code-specialized model
// Released: November 2023
// Source: https://huggingface.co/deepseek-ai/deepseek-coder-7b-base-v1.5
export default {
  id: 'deepseek_coder_7b',
  released: '2023-11',
  name: 'DeepSeek Coder 7B',
  type: 'dense',
  params: 6.7,
  layers: 30,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 16384,
  links: {
    ollama: 'ollama pull deepseek-coder:6.7b',
    hf: 'https://huggingface.co/deepseek-ai/deepseek-coder-7b-base-v1.5',
    ms: 'https://modelscope.cn/models/deepseek-ai/deepseek-coder-7b-base-v1.5',
  },
}
