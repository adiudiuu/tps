// MiniMax M3: ~428B MoE / ~23B active, 128 routed + 1 shared expert, 1M context
// Source: https://huggingface.co/MiniMaxAI/MiniMax-M3/blob/main/config.json
export default {
  id: 'minimax_m3',
  name: 'MiniMax M3',
  type: 'moe',
  params: 428,
  active_params: 23,
  experts: 128,
  experts_per_token: 4,
  moe_execution: 'shared_routed',
  layers: 60,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 6144,
  max_ctx: 1048576,
  vision_seq_tokens: 576,
  tags: ['chat', 'multilingual', 'vision', 'multimodal'],
  released: '2026-06',
  links: {
    hf: 'https://huggingface.co/MiniMaxAI/MiniMax-M3',
  },
}
