// MiniMax-M2.5: 230B MoE, 10B active, 62 layers, 256 experts (8 active), 200K context
// Released: February 2026
// Source: https://huggingface.co/MiniMaxAI/MiniMax-M2.5
export default {
  id: 'minimax_m2_5',
  name: 'MiniMax M2.5',
  type: 'moe',
  params: 230,
  active_params: 10,
  mla_ratio: null,
  layers: 62,
  kv_heads: 8,
  head_dim: 64,
  hidden_size: 3072,
  max_ctx: 200000,
  released: '2026-02',
  links: {
    hf: 'https://huggingface.co/MiniMaxAI/MiniMax-M2.5',
  },
}
