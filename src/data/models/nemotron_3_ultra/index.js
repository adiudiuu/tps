// NVIDIA Nemotron 3 Ultra: 550B hybrid LatentMoE, 55B active, 1M context
// Source: https://developer.nvidia.com/blog/nvidia-nemotron-3-ultra-powers-faster-more-efficient-reasoning-for-long-running-agents/
// Config: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16/blob/main/config.json
export default {
  id: 'nemotron_3_ultra',
  released: '2026-06',
  name: 'NVIDIA Nemotron 3 Ultra (550B-A55B)',
  type: 'moe',
  params: 550,
  active_params: 55,
  experts: 512,
  experts_per_token: 22,
  moe_execution: 'shared_routed',
  layers: 108,
  // 12 attention blocks among 108 interleaved Mamba-2 / MoE / attention blocks
  mamba_ratio: 12 / 108,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 1048576,
  tags: ['chat', 'reasoning', 'coding', 'multilingual'],
  links: {
    hf: 'https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16',
  },
}
