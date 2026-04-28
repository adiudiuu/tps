export default {
  id: 'llama3_70b',
  released: '2024-04',
  name: 'Llama 3 70B',
  type: 'dense',
  params: 70,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull llama3:70b',
    hf: 'https://huggingface.co/meta-llama/Meta-Llama-3-70B',
    ms: 'https://modelscope.cn/models/LLM-Research/Meta-Llama-3-70B',
  },
}
