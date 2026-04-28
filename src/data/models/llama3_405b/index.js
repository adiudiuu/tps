export default {
  id: 'llama3_405b',
  released: '2024-07',
  name: 'Llama 3.1 405B',
  type: 'dense',
  params: 405,
  layers: 126,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 16384,
  max_ctx: 131072,
  links: {
    ollama: null,
    hf: 'https://huggingface.co/meta-llama/Meta-Llama-3.1-405B',
    ms: 'https://modelscope.cn/models/LLM-Research/Meta-Llama-3.1-405B',
  },
}
