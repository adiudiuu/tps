// Qwen2.5 14B: dense, 48 layers, GQA (40 heads / 8 KV heads), 128K ctx
// Source: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct/blob/main/config.json
export default {
  id: 'qwen25_14b',
  released: '2024-09',
  name: 'Qwen2.5 14B',
  type: 'dense',
  params: 14.7,
  layers: 48,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull qwen2.5:14b',
    hf: 'https://huggingface.co/Qwen/Qwen2.5-14B-Instruct',
    ms: 'https://modelscope.cn/models/Qwen/Qwen2.5-14B-Instruct',
  },
}
