// Llama 3.3 70B: dense, 80 layers, GQA (64 heads / 8 KV heads), 128K ctx
// Same architecture as Llama 3.1 70B, improved training data
// Source: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
export default {
  id: 'llama3_3_70b',
  released: '2024-12',
  name: 'Llama 3.3 70B',
  type: 'dense',
  params: 70.6,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull llama3.3',
    hf: 'https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct',
    ms: 'https://modelscope.cn/models/LLM-Research/Llama-3.3-70B-Instruct',
  },
}
