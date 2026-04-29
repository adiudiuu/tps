// Llama 3.2 3B: dense, lightweight model for edge devices, 128K ctx
// Source: https://huggingface.co/meta-llama/Llama-3.2-3B
export default {
  id: 'llama3_2_3b',
  released: '2024-09',
  name: 'Llama 3.2 3B',
  type: 'dense',
  params: 3.2,
  layers: 28,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 3072,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull llama3.2:3b',
    hf: 'https://huggingface.co/meta-llama/Llama-3.2-3B',
  },
}
