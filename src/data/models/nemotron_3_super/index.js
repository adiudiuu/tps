// NVIDIA Nemotron 3 Super: 120B hybrid LatentMoE, 12B active, 1M context
// Source: https://research.nvidia.com/labs/nemotron/Nemotron-3-Super/
// Config: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16/blob/main/config.json
export default {
  id: 'nemotron_3_super',
  released: '2026-03',
  name: 'NVIDIA Nemotron 3 Super (120B-A12B)',
  type: 'moe',
  params: 120,
  active_params: 12,
  experts: 512,
  experts_per_token: 22,
  moe_execution: 'shared_routed',
  layers: 88,
  // 8 attention blocks among 88 interleaved Mamba-2 / MoE / attention blocks
  mamba_ratio: 8 / 88,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 1048576,
  tags: ['chat', 'reasoning', 'coding', 'multilingual'],
  links: {
    hf: 'https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16',
  },
}
