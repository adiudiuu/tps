// QwQ 32B: reasoning-focused model
// Released: November 2024
// Source: https://huggingface.co/Qwen/QwQ-32B-Preview
export default {
  id: 'qwq_32b',
  released: '2024-11',
  name: 'QwQ 32B Preview',
  type: 'dense',
  params: 32.5,
  layers: 64,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 32768,
  links: {
    ollama: 'ollama pull qwq',
    hf: 'https://huggingface.co/Qwen/QwQ-32B-Preview',
    ms: 'https://modelscope.cn/models/qwen/QwQ-32B-Preview',
  },
}
