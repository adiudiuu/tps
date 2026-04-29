// DeepSeek-Coder 33B: dense, 87% code + 13% NL, 16K ctx
// Source: https://huggingface.co/deepseek-ai/deepseek-coder-33b-instruct
export default {
  id: 'deepseek_coder_33b',
  released: '2023-11',
  name: 'DeepSeek-Coder 33B',
  type: 'dense',
  params: 33,
  layers: 62,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 7168,
  max_ctx: 16384,
  links: {
    hf: 'https://huggingface.co/deepseek-ai/deepseek-coder-33b-instruct',
  },
}
