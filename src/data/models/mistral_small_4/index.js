// Mistral Small 4: 119B MoE, 6.5B active, MLA, 256K ctx
// Released: March 2026
// Source: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603
export default {
  id: 'mistral_small_4',
  released: '2026-03',
  name: 'Mistral Small 4',
  type: 'moe',
  params: 119,
  active_params: 6.5,
  experts: 128,
  experts_per_token: 4,
  moe_execution: 'shared_routed',
  mla_ratio: 0.28,
  layers: 36,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 262144,
  tags: ['chat', 'multilingual', 'coding', 'multimodal', 'reasoning'],
  links: {
    hf: 'https://huggingface.co/mistralai/Mistral-Small-4-119B-2603',
  },
}
