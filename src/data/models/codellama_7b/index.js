// CodeLlama 7B: dense, code-specific model based on Llama 2, 16K ctx
// Source: https://huggingface.co/codellama/CodeLlama-7b-hf
export default {
  id: 'codellama_7b',
  released: '2023-08',
  name: 'CodeLlama 7B',
  type: 'dense',
  params: 7,
  layers: 32,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 16384,
  links: {
    ollama: 'ollama pull codellama:7b',
    hf: 'https://huggingface.co/codellama/CodeLlama-7b-hf',
  },
}
