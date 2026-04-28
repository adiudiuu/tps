// Qwen3 32B: dense model, 64 layers, GQA 64Q/8KV
// Released: April 2025
// Source: https://huggingface.co/Qwen/Qwen3-32B
export default {
  id: 'qwen3_32b',
  name: 'Qwen3 32B',
  type: 'dense',
  params: 32.8,
  layers: 64,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 131072,
  released: '2025-04',
  links: {
    ollama: 'ollama pull qwen3:32b',
    hf: 'https://huggingface.co/Qwen/Qwen3-32B',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3-32B',
  },
}
