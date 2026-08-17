// MiniMax-M2.7: 229B MoE, 10B active, 62 layers, 256 experts (8 active), 204800 ctx
// Released: April 2026
// Source: https://huggingface.co/MiniMaxAI/MiniMax-M2.7/blob/main/config.json
export default {
  id: 'minimax_m2_7',
  name: 'MiniMax M2.7',
  type: 'moe',
  params: 229,
  active_params: 10,
  experts: 256,
  experts_per_token: 8,
  mla_ratio: null,
  layers: 62,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 3072,
  max_ctx: 204800,
  tags: ['chat', 'multilingual'],
  released: '2026-04',
  links: {
    hf: 'https://huggingface.co/MiniMaxAI/MiniMax-M2.7',
  },
}
