// MiniMax-Text-01: 456B MoE, 45.9B active, 10M context, Lightning+Softmax hybrid attention
// Released: January 2025
// Source: https://huggingface.co/MiniMaxAI/MiniMax-Text-01
export default {
  id: 'minimax_text_01',
  name: 'MiniMax Text-01',
  type: 'moe',
  params: 456,
  active_params: 45.9,
  mla_ratio: null,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 6144,
  max_ctx: 1048576,
  released: '2025-01',
  links: {
    hf: 'https://huggingface.co/MiniMaxAI/MiniMax-Text-01',
    ms: 'https://modelscope.cn/models/MiniMaxAI/MiniMax-Text-01',
  },
}
