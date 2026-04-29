// Phind-CodeLlama 34B v2: dense, fine-tuned for code generation, 16K ctx
// Source: https://huggingface.co/Phind/Phind-CodeLlama-34B-v2
export default {
  id: 'phind_codellama_34b',
  released: '2023-09',
  name: 'Phind-CodeLlama 34B',
  type: 'dense',
  params: 34,
  layers: 48,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 16384,
  links: {
    ollama: 'ollama pull phind-codellama:34b',
    hf: 'https://huggingface.co/Phind/Phind-CodeLlama-34B-v2',
  },
}
