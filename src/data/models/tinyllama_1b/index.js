export default {
  id: 'tinyllama_1b',
  released: '2024-01',
  name: 'TinyLlama 1.1B',
  type: 'dense',
  params: 1.1,
  layers: 22,
  kv_heads: 4,
  head_dim: 64,
  hidden_size: 2048,
  max_ctx: 2048,
  links: {
    ollama: 'ollama pull tinyllama',
    hf: 'https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0',
    ms: 'https://modelscope.cn/models/LLM-Research/TinyLlama-1.1B-Chat-v1.0',
  },
}
