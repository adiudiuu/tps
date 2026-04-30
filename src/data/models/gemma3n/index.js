// Gemma 3n: Edge-optimized model with MobileNet hybrid architecture
// Designed for mobile and edge devices
// Source: Community reports and edge deployment patterns
export default {
  id: 'gemma3n',
  released: '2025-04',
  name: 'Gemma 3n',
  type: 'dense',
  params: 1.0,
  layers: 24,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 1024,
  max_ctx: 8192,
  links: {
    ollama: null,
    hf: 'https://huggingface.co/google/gemma-3n',
    ms: null,
  },
}
