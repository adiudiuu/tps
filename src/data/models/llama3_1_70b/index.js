// Llama 3.1 70B: dense, 80 layers, GQA (64 heads / 8 KV heads), 128K ctx
// Source: https://huggingface.co/meta-llama/Meta-Llama-3.1-70B-Instruct/blob/main/config.json
export default {
  id: 'llama3_1_70b',
  released: '2024-07',
  name: 'Llama 3.1 70B',
  type: 'dense',
  params: 70.6,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull llama3.1:70b',
    hf: 'https://huggingface.co/meta-llama/Meta-Llama-3.1-70B-Instruct',
    ms: 'https://modelscope.cn/models/LLM-Research/Meta-Llama-3.1-70B-Instruct',
  },
}
