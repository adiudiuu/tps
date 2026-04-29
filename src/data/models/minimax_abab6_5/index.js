// MiniMax ABAB 6.5: earlier generation model
// Released: December 2024
// Source: https://platform.minimaxi.com/document/guides/chat-model/V6
export default {
  id: 'minimax_abab6_5',
  released: '2024-12',
  name: 'MiniMax ABAB 6.5',
  type: 'moe',
  params: 456,
  active_params: 45,
  mla_ratio: null,
  layers: 64,
  kv_heads: 64,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 245760,
  links: {
    hf: 'https://huggingface.co/MiniMaxAI/MiniMax-Text-01',
  },
}
