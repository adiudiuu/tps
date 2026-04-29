// Qwen2.5 7B: dense, 28 layers, GQA (28 heads / 4 KV heads), 128K ctx
// Source: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/config.json
export default {
  id: 'qwen25_7b',
  released: '2024-09',
  name: 'Qwen2.5 7B',
  type: 'dense',
  params: 7.6,
  layers: 28,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 3584,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull qwen2.5:7b',
    hf: 'https://huggingface.co/Qwen/Qwen2.5-7B-Instruct',
    ms: 'https://modelscope.cn/models/Qwen/Qwen2.5-7B-Instruct',
  },
}
