// Qwen2.5 3B: dense, 36 layers, GQA (16 heads / 2 KV heads), 128K ctx
// Source: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/config.json
export default {
  id: 'qwen25_3b',
  released: '2024-09',
  name: 'Qwen2.5 3B',
  type: 'dense',
  params: 3.1,
  layers: 36,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 2048,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull qwen2.5:3b',
    hf: 'https://huggingface.co/Qwen/Qwen2.5-3B-Instruct',
    ms: 'https://modelscope.cn/models/Qwen/Qwen2.5-3B-Instruct',
  },
}
