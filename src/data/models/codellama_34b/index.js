// CodeLlama 34B: dense, code-specific model based on Llama 2, GQA, 16K ctx
// Source: https://huggingface.co/codellama/CodeLlama-34b-hf
export default {
  id: 'codellama_34b',
  released: '2023-08',
  name: 'CodeLlama 34B',
  type: 'dense',
  params: 34,
  layers: 48,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 16384,
  links: {
    ollama: 'ollama pull codellama:34b',
    hf: 'https://huggingface.co/codellama/CodeLlama-34b-hf',
  },
}
