// DeepSeek-Coder 6.7B: dense, 87% code + 13% NL, 16K ctx
// Source: https://huggingface.co/deepseek-ai/deepseek-coder-6.7b-instruct
export default {
  id: 'deepseek_coder_6_7b',
  released: '2023-11',
  name: 'DeepSeek-Coder 6.7B',
  type: 'dense',
  params: 6.7,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 16384,
  links: {
    ollama: 'ollama pull deepseek-coder:6.7b',
    hf: 'https://huggingface.co/deepseek-ai/deepseek-coder-6.7b-instruct',
  },
}
