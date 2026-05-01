// Falcon3 10B: TII flagship dense model
// Source: https://huggingface.co/tiiuae/Falcon3-10B-Base
export default {
  id: 'falcon3_10b',
  released: '2024-12',
  name: 'Falcon3 10B',
  type: 'dense',
  params: 10.0,
  layers: 40,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/tiiuae/Falcon3-10B-Base',
    ollama: 'ollama pull falcon3:10b',
  },
}
