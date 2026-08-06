// Llama Guard 3 11B Vision: multimodal safety model
// Released: September 2024
// Source: https://huggingface.co/meta-llama/Llama-Guard-3-11B-Vision
export default {
  id: 'llama_guard_3_11b_vision',
  released: '2024-09',
  name: 'Llama Guard 3 11B Vision',
  type: 'dense',
  params: 11.0,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  tags: ['vision'],
  // 基于 Llama 3.2 11B Vision 同构；官方 model card：图像切为 4×560×560 chunk
  // vision_seq_tokens 与本仓库 llama3_2_vision_11b 对齐（1601）
  vision_encoder_params: 2.5,
  vision_seq_tokens: 1601,
  links: {
    hf: 'https://huggingface.co/meta-llama/Llama-Guard-3-11B-Vision',
  },
}
