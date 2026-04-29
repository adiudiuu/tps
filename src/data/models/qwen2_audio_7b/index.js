// Qwen2-Audio 7B: audio understanding model
// Released: August 2024
// Source: https://huggingface.co/Qwen/Qwen2-Audio-7B-Instruct
export default {
  id: 'qwen2_audio_7b',
  released: '2024-08',
  name: 'Qwen2-Audio 7B',
  type: 'dense',
  params: 7.6,
  layers: 28,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 3584,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen2-Audio-7B-Instruct',
    ms: 'https://modelscope.cn/models/qwen/Qwen2-Audio-7B-Instruct',
  },
}
