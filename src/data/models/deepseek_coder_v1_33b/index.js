// DeepSeek Coder V1 33B: large code model
// Released: November 2023
// Source: https://huggingface.co/deepseek-ai/deepseek-coder-33b-base
export default {
  id: 'deepseek_coder_v1_33b',
  released: '2023-11',
  name: 'DeepSeek Coder V1 33B',
  type: 'dense',
  params: 33.0,
  layers: 60,
  kv_heads: 10,
  head_dim: 128,
  hidden_size: 7168,
  max_ctx: 16384,
  links: {
    ollama: 'ollama pull deepseek-coder:33b',
    hf: 'https://huggingface.co/deepseek-ai/deepseek-coder-33b-base',
    ms: 'https://modelscope.cn/models/deepseek-ai/deepseek-coder-33b-base',
  },
}
