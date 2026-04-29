// DeepSeek-Coder 1.3B: dense, 87% code + 13% NL, 16K ctx
// Source: https://huggingface.co/deepseek-ai/deepseek-coder-1.3b-instruct
export default {
  id: 'deepseek_coder_1_3b',
  released: '2023-11',
  name: 'DeepSeek-Coder 1.3B',
  type: 'dense',
  params: 1.3,
  layers: 24,
  kv_heads: 16,
  head_dim: 128,
  hidden_size: 2048,
  max_ctx: 16384,
  links: {
    ollama: 'ollama pull deepseek-coder:1.3b',
    hf: 'https://huggingface.co/deepseek-ai/deepseek-coder-1.3b-instruct',
  },
}
