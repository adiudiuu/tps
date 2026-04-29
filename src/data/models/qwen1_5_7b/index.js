// Qwen1.5 7B: 32 layers, MHA (32 heads), 32K ctx
// Source: https://huggingface.co/Qwen/Qwen1.5-7B/blob/main/config.json
export default {
  id: 'qwen1_5_7b',
  released: '2024-02',
  name: 'Qwen1.5 7B',
  type: 'dense',
  params: 7.7,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen1.5-7B-Chat',
    ms: 'https://modelscope.cn/models/Qwen/Qwen1.5-7B-Chat',
    ollama: 'https://ollama.com/library/qwen:7b',
  },
}
