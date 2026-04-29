// Qwen2.5 72B: dense, 80 layers, GQA (64 heads / 8 KV heads), 128K ctx
// Source: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct/blob/main/config.json
export default {
  id: 'qwen25_72b',
  released: '2024-09',
  name: 'Qwen2.5 72B',
  type: 'dense',
  params: 72.7,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull qwen2.5:72b',
    hf: 'https://huggingface.co/Qwen/Qwen2.5-72B-Instruct',
    ms: 'https://modelscope.cn/models/Qwen/Qwen2.5-72B-Instruct',
  },
}
