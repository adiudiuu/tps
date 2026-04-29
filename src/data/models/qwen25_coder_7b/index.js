// Qwen2.5-Coder 7B: dense, code-specific model, GQA (28 heads / 4 KV heads), 128K ctx
// Source: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
export default {
  id: 'qwen25_coder_7b',
  released: '2024-11',
  name: 'Qwen2.5-Coder 7B',
  type: 'dense',
  params: 7.6,
  layers: 28,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 3584,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull qwen2.5-coder:7b',
    hf: 'https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct',
    ms: 'https://modelscope.cn/models/Qwen/Qwen2.5-Coder-7B-Instruct',
  },
}
