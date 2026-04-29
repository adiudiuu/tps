// MiniMax ABAB 6: base generation model
// Released: September 2024
// Source: https://platform.minimaxi.com/document/guides/chat-model/V6
export default {
  id: 'minimax_abab6',
  released: '2024-09',
  name: 'MiniMax ABAB 6',
  type: 'moe',
  params: 400,
  active_params: 40,
  mla_ratio: null,
  layers: 60,
  kv_heads: 60,
  head_dim: 128,
  hidden_size: 7680,
  max_ctx: 245760,
  links: {
    hf: 'https://huggingface.co/MiniMaxAI',
  },
}
