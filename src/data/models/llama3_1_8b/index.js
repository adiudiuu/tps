// Llama 3.1 8B: dense, 32 layers, GQA (32 heads / 8 KV heads), 128K ctx
// Source: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct/blob/main/config.json
export default {
  id: 'llama3_1_8b',
  released: '2024-07',
  name: 'Llama 3.1 8B',
  type: 'dense',
  params: 8.0,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull llama3.1:8b',
    hf: 'https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct',
    ms: 'https://modelscope.cn/models/LLM-Research/Meta-Llama-3.1-8B-Instruct',
  },
}
