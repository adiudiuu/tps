// Llama 3.2 1B: dense, lightweight model for edge devices, 128K ctx
// Source: https://huggingface.co/meta-llama/Llama-3.2-1B
export default {
  id: 'llama3_2_1b',
  released: '2024-09',
  name: 'Llama 3.2 1B',
  type: 'dense',
  params: 1.2,
  layers: 16,
  kv_heads: 8,
  head_dim: 64,
  hidden_size: 2048,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull llama3.2:1b',
    hf: 'https://huggingface.co/meta-llama/Llama-3.2-1B',
  },
}
