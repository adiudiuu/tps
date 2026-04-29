// CodeLlama 13B: dense, code-specific model based on Llama 2, 16K ctx
// Source: https://huggingface.co/codellama/CodeLlama-13b-hf
export default {
  id: 'codellama_13b',
  released: '2023-08',
  name: 'CodeLlama 13B',
  type: 'dense',
  params: 13,
  layers: 40,
  kv_heads: 5,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 16384,
  links: {
    ollama: 'ollama pull codellama:13b',
    hf: 'https://huggingface.co/codellama/CodeLlama-13b-hf',
  },
}
