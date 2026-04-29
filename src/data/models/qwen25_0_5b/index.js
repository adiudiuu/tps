// Qwen2.5 0.5B: dense, 24 layers, GQA (14 heads / 2 KV heads), 128K ctx
// Source: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/main/config.json
export default {
  id: 'qwen25_0_5b',
  released: '2024-09',
  name: 'Qwen2.5 0.5B',
  type: 'dense',
  params: 0.5,
  layers: 24,
  kv_heads: 2,
  head_dim: 64,
  hidden_size: 896,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull qwen2.5:0.5b',
    hf: 'https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct',
    ms: 'https://modelscope.cn/models/Qwen/Qwen2.5-0.5B-Instruct',
  },
}
