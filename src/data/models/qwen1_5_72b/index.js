// Qwen1.5 72B: 80 layers, GQA (64 heads / 8 KV heads), 32K ctx
// Source: https://huggingface.co/Qwen/Qwen1.5-72B/blob/main/config.json
export default {
  id: 'qwen1_5_72b',
  released: '2024-02',
  name: 'Qwen1.5 72B',
  type: 'dense',
  params: 72.7,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen1.5-72B-Chat',
    ms: 'https://modelscope.cn/models/Qwen/Qwen1.5-72B-Chat',
    ollama: 'https://ollama.com/library/qwen:72b',
  },
}
