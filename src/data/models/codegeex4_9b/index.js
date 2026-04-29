// CodeGeeX4 9B: code generation model
// Released: July 2024
// Source: https://huggingface.co/THUDM/codegeex4-all-9b
export default {
  id: 'codegeex4_9b',
  released: '2024-07',
  name: 'CodeGeeX4 9B',
  type: 'dense',
  params: 9.4,
  layers: 40,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/THUDM/codegeex4-all-9b',
    ms: 'https://modelscope.cn/models/ZhipuAI/codegeex4-all-9b',
  },
}
