// CodeGemma 2B: dense, fast code completion by Google, 8K ctx
// Source: https://huggingface.co/google/codegemma-2b
export default {
  id: 'codegemma_2b',
  released: '2024-04',
  name: 'CodeGemma 2B',
  type: 'dense',
  params: 2,
  layers: 18,
  kv_heads: 1,
  head_dim: 256,
  hidden_size: 2048,
  max_ctx: 8192,
  links: {
    ollama: 'ollama pull codegemma:2b',
    hf: 'https://huggingface.co/google/codegemma-2b',
  },
}
