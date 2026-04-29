// MiniMax Video-01: video generation model
// Released: December 2024
// Source: https://hailuoai.com/video
export default {
  id: 'minimax_video_01',
  released: '2024-12',
  name: 'MiniMax Video-01',
  type: 'dense',
  params: 15.0,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/MiniMaxAI',
  },
}
