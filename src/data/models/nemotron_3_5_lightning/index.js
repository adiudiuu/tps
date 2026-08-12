// NVIDIA Nemotron 3.5 Lightning: 30B hybrid MoE / 3B active, Mamba-2 + MoE + Attention
// Released: 2026-08-11; distilled from Nemotron 3 Ultra for agent execution
// Architecture aligned with Nemotron 3 Nano (52 blocks, 6 attention / 128E top-6 + 1 shared)
// Source: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16/blob/main/config.json
export default {
  id: 'nemotron_3_5_lightning',
  released: '2026-08',
  name: 'NVIDIA Nemotron 3.5 Lightning (30B-A3B)',
  type: 'moe',
  params: 30,
  active_params: 3,
  experts: 128,
  experts_per_token: 6,
  moe_execution: 'shared_routed',
  layers: 52,
  // 6 attention blocks among 52 interleaved Mamba-2 / MoE / attention blocks
  mamba_ratio: 6 / 52,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 2688,
  // HF config max_position_embeddings=262144; product docs claim up to 1M (same as Nano)
  max_ctx: 1048576,
  tags: ['chat', 'reasoning', 'coding', 'multilingual'],
  links: {
    hf: 'https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16',
  },
}
