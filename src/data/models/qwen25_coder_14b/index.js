// Qwen2.5-Coder 14B: dense, code-specific model, GQA (40 heads / 8 KV heads), 128K ctx
// Source: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
export default {
  id: 'qwen25_coder_14b',
  released: '2024-11',
  name: 'Qwen2.5-Coder 14B',
  type: 'dense',
  params: 14.7,
  layers: 48,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull qwen2.5-coder:14b',
    hf: 'https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct',
    ms: 'https://modelscope.cn/models/Qwen/Qwen2.5-Coder-14B-Instruct',
  },
}
