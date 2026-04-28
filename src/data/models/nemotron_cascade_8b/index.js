// Nemotron-Cascade 8B
// Source: https://huggingface.co/nvidia/Nemotron-Cascade-8B
export default {
  id: 'nemotron_cascade_8b',
  released: '2026-03',
  name: 'Nemotron-Cascade 8B',
  type: 'dense',
  params: 8,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 3072,
  max_ctx: 65536,
  links: {
    ollama: 'ollama pull nemotron-cascade:8b',
    hf: 'https://huggingface.co/nvidia/Nemotron-Cascade-8B',
  },
}
