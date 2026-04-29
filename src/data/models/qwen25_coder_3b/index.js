// Qwen2.5-Coder 3B: dense, code-specific model, 128K ctx
// Source: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
export default {
  id: 'qwen25_coder_3b',
  released: '2024-11',
  name: 'Qwen2.5-Coder 3B',
  type: 'dense',
  params: 3.1,
  layers: 36,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 2048,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull qwen2.5-coder:3b',
    hf: 'https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct',
    ms: 'https://modelscope.cn/models/Qwen/Qwen2.5-Coder-3B-Instruct',
  },
}
