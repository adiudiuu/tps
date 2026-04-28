// MiniMax-M1-40k: 456B MoE, 45.9B active, reasoning model, Lightning+Softmax hybrid attention
// Released: May 2025
// Source: https://huggingface.co/MiniMaxAI/MiniMax-M1-40k
export default {
  id: 'minimax_m1',
  name: 'MiniMax M1',
  type: 'moe',
  params: 456,
  active_params: 45.9,
  mla_ratio: null,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 6144,
  max_ctx: 1048576,
  released: '2025-05',
  links: {
    hf: 'https://huggingface.co/MiniMaxAI/MiniMax-M1-40k',
    ms: 'https://modelscope.cn/models/MiniMaxAI/MiniMax-M1-40k',
  },
}
