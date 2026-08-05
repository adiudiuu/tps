// NVIDIA Nemotron 3 Nano: 31.6B hybrid MoE, 3.2B active (3.6B incl. embeddings)
// Source: https://research.nvidia.com/labs/nemotron/Nemotron-3/
// Config: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16/blob/main/config.json
export default {
  id: 'nemotron_3_nano',
  released: '2025-12',
  name: 'NVIDIA Nemotron 3 Nano (30B-A3B)',
  type: 'moe',
  params: 31.6,
  active_params: 3.2,
  experts: 128,
  experts_per_token: 6,
  moe_execution: 'shared_routed',
  layers: 52,
  // 6 attention blocks among 52 interleaved Mamba-2 / MoE / attention blocks
  mamba_ratio: 6 / 52,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 2688,
  max_ctx: 1048576,
  tags: ['chat', 'reasoning', 'coding', 'multilingual'],
  links: {
    hf: 'https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16',
  },
}
