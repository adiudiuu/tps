// Llama Pro 8B: Llama 2 with expanded layers
// Released: January 2024
// Source: https://huggingface.co/TencentARC/LLaMA-Pro-8B
export default {
  id: 'llama_pro_8b',
  released: '2024-01',
  name: 'Llama Pro 8B',
  type: 'dense',
  params: 8.3,
  layers: 40,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/TencentARC/LLaMA-Pro-8B',
  },
}
