// Qwen3 14B: dense, 40 layers, GQA (40 heads / 8 KV heads), 128K ctx
// Source: https://huggingface.co/Qwen/Qwen3-14B/blob/main/config.json
export default {
  id: 'qwen3_14b',
  released: '2025-04',
  name: 'Qwen3 14B',
  type: 'dense',
  params: 14.8,
  layers: 40,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull qwen3:14b',
    hf: 'https://huggingface.co/Qwen/Qwen3-14B',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3-14B',
  },
}
