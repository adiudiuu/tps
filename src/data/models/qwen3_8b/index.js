// Qwen3 8B: dense, 36 layers, GQA (32 heads / 8 KV heads), 128K ctx
// Source: https://huggingface.co/Qwen/Qwen3-8B/blob/main/config.json
export default {
  id: 'qwen3_8b',
  released: '2025-04',
  name: 'Qwen3 8B',
  type: 'dense',
  params: 8.2,
  layers: 36,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull qwen3:8b',
    hf: 'https://huggingface.co/Qwen/Qwen3-8B',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3-8B',
  },
}
