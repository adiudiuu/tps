// Qwen2.5 1.5B: dense, 28 layers, GQA (12 heads / 2 KV heads), 128K ctx
// Source: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/config.json
export default {
  id: 'qwen25_1_5b',
  released: '2024-09',
  name: 'Qwen2.5 1.5B',
  type: 'dense',
  params: 1.5,
  layers: 28,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 1536,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull qwen2.5:1.5b',
    hf: 'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct',
    ms: 'https://modelscope.cn/models/Qwen/Qwen2.5-1.5B-Instruct',
  },
}
