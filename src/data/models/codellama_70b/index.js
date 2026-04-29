// CodeLlama 70B: dense, code-specific model based on Llama 2, GQA (64 heads / 8 KV heads), 16K ctx
// Source: https://huggingface.co/codellama/CodeLlama-70b-hf
export default {
  id: 'codellama_70b',
  released: '2024-01',
  name: 'CodeLlama 70B',
  type: 'dense',
  params: 70,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 16384,
  links: {
    ollama: 'ollama pull codellama:70b',
    hf: 'https://huggingface.co/codellama/CodeLlama-70b-hf',
  },
}
