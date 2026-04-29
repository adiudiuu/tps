// Qwen 1.8B: compact base model
// Released: December 2023
// Source: https://huggingface.co/Qwen/Qwen-1_8B
export default {
  id: 'qwen_1_8b',
  released: '2023-12',
  name: 'Qwen 1.8B',
  type: 'dense',
  params: 1.8,
  layers: 24,
  kv_heads: 16,
  head_dim: 128,
  hidden_size: 2048,
  max_ctx: 8192,
  links: {
    ollama: 'ollama pull qwen:1.8b',
    hf: 'https://huggingface.co/Qwen/Qwen-1_8B',
    ms: 'https://modelscope.cn/models/qwen/Qwen-1_8B',
  },
}
