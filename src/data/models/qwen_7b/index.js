// Qwen 7B: Alibaba's base model
// Released: August 2023
// Source: https://huggingface.co/Qwen/Qwen-7B
export default {
  id: 'qwen_7b',
  released: '2023-08',
  name: 'Qwen 7B',
  type: 'dense',
  params: 7.7,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 8192,
  links: {
    ollama: 'ollama pull qwen:7b',
    hf: 'https://huggingface.co/Qwen/Qwen-7B',
    ms: 'https://modelscope.cn/models/qwen/Qwen-7B',
  },
}
