// Qwen3.5-27B: dense, 64 layers, hybrid attention (full every 4 layers), 256K ctx
// Source: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/config.json
export default {
  id: 'qwen35_27b',
  released: '2026-02',
  name: 'Qwen3.5 27B',
  type: 'dense',
  params: 27,
  layers: 64,
  kv_heads: 4,
  head_dim: 256,
  hidden_size: 5120,
  max_ctx: 262144,
  links: {
    ollama: 'ollama pull qwen3.5:27b',
    hf: 'https://huggingface.co/Qwen/Qwen3.5-27B',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3.5-27B',
  },
}
