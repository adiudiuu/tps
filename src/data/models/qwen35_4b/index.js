// Qwen3.5-4B: dense, 32 layers, hybrid attention (full every 4 layers), 256K ctx
// Source: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/config.json
export default {
  id: 'qwen35_4b',
  released: '2026-03',
  name: 'Qwen3.5 4B',
  type: 'dense',
  params: 4,
  layers: 32,
  kv_heads: 4,
  head_dim: 256,
  hidden_size: 2560,
  max_ctx: 262144,
  links: {
    ollama: 'ollama pull qwen3.5:4b',
    hf: 'https://huggingface.co/Qwen/Qwen3.5-4B',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3.5-4B',
  },
}
