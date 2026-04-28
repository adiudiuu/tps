export default {
  id: 'llama3_8b',
  released: '2024-04',
  name: 'Llama 3 8B',
  type: 'dense',
  params: 8,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull llama3',
    hf: 'https://huggingface.co/meta-llama/Meta-Llama-3-8B',
    ms: 'https://modelscope.cn/models/LLM-Research/Meta-Llama-3-8B',
  },
}
