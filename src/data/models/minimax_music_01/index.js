// MiniMax Music-01: music generation model
// Released: January 2025
// Source: https://hailuoai.com/music
export default {
  id: 'minimax_music_01',
  released: '2025-01',
  name: 'MiniMax Music-01',
  type: 'dense',
  params: 10.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/MiniMaxAI',
  },
}
