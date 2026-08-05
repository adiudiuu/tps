// Leanstral 1.5: 119B MoE / 6.5B active, MLA, multimodal, 256K context
// Source: https://mistral.ai/news/leanstral-1-5/
// Config: https://huggingface.co/mistralai/Leanstral-1.5-119B-A6B/blob/main/params.json
export default {
  id: 'leanstral_1_5',
  released: '2026-07',
  name: 'Leanstral 1.5 (119B-A6B)',
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
  tags: ['chat', 'reasoning', 'coding', 'vision', 'multimodal'],
  links: {
    hf: 'https://huggingface.co/mistralai/Leanstral-1.5-119B-A6B',
  },
}
