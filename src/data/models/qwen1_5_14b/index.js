// Qwen1.5 14B: 40 layers, GQA (40 heads / 8 KV heads), 32K ctx
// Source: https://huggingface.co/Qwen/Qwen1.5-14B/blob/main/config.json
export default {
  id: 'qwen1_5_14b',
  released: '2024-02',
  name: 'Qwen1.5 14B',
  type: 'dense',
  params: 14.2,
  layers: 40,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen1.5-14B-Chat',
    ms: 'https://modelscope.cn/models/Qwen/Qwen1.5-14B-Chat',
    ollama: 'https://ollama.com/library/qwen:14b',
  },
}
