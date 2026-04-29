// Qwen 72B: Alibaba's large model
// Released: November 2023
// Source: https://huggingface.co/Qwen/Qwen-72B
export default {
  id: 'qwen_72b',
  released: '2023-11',
  name: 'Qwen 72B',
  type: 'dense',
  params: 72.0,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 32768,
  links: {
    ollama: 'ollama pull qwen:72b',
    hf: 'https://huggingface.co/Qwen/Qwen-72B',
    ms: 'https://modelscope.cn/models/qwen/Qwen-72B',
  },
}
