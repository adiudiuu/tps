// Nemotron-Cascade 2: 30B MoE with 3B active parameters
// Source: https://research.nvidia.com/labs/nemotron/nemotron-cascade-2/
export default {
  id: 'nemotron_cascade_2_30b',
  released: '2026-03',
  name: 'Nemotron-Cascade 2 (30B MoE)',
  type: 'moe',
  params: 30,
  active_params: 3,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 3072,
  max_ctx: 65536,
  links: {
    ollama: 'ollama pull nemotron-cascade-2',
    hf: 'https://huggingface.co/nvidia/Nemotron-Cascade-2-30B-A3B',
  },
}
