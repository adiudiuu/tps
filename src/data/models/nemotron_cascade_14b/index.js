// Nemotron-Cascade 14B Thinking (post-trained from Qwen3-14B)
// Source: https://huggingface.co/nvidia/Nemotron-Cascade-14B-Thinking
export default {
  id: 'nemotron_cascade_14b',
  released: '2026-03',
  name: 'Nemotron-Cascade 14B Thinking',
  type: 'dense',
  params: 14,
  layers: 40,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 3584,
  max_ctx: 65536,
  links: {
    ollama: 'ollama pull nemotron-cascade:14b',
    hf: 'https://huggingface.co/nvidia/Nemotron-Cascade-14B-Thinking',
  },
}
