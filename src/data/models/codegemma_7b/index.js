// CodeGemma 7B: dense, code-specific model by Google, 8K ctx
// Source: https://huggingface.co/google/codegemma-7b
export default {
  id: 'codegemma_7b',
  released: '2024-04',
  name: 'CodeGemma 7B',
  type: 'dense',
  params: 7,
  layers: 28,
  kv_heads: 4,
  head_dim: 256,
  hidden_size: 3072,
  max_ctx: 8192,
  links: {
    ollama: 'ollama pull codegemma:7b',
    hf: 'https://huggingface.co/google/codegemma-7b',
  },
}
