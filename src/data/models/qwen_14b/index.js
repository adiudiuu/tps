// Qwen 14B: Alibaba's mid-size model
// Released: September 2023
// Source: https://huggingface.co/Qwen/Qwen-14B
export default {
  id: 'qwen_14b',
  released: '2023-09',
  name: 'Qwen 14B',
  type: 'dense',
  params: 14.0,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 8192,
  links: {
    ollama: 'ollama pull qwen:14b',
    hf: 'https://huggingface.co/Qwen/Qwen-14B',
    ms: 'https://modelscope.cn/models/qwen/Qwen-14B',
  },
}
