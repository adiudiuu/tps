// InternVL2 26B: Shanghai AI Lab vision-language model
// Source: https://huggingface.co/OpenGVLab/InternVL2-26B
export default {
  id: 'internvl2_26b',
  released: '2024-07',
  name: 'InternVL2 26B',
  type: 'dense',
  params: 25.5,
  layers: 48,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 8192,
  tags: ['vision'],
  // vision: InternViT-6B-448px；每 448×448 tile → 256 tokens（pixel shuffle downsample_ratio=0.5）
  // Source: InternVL2 docs / config force_image_size=448, downsample_ratio=0.5
  vision_encoder_params: 6.0,
  vision_encoder_in_params: true, // 25.5B ≈ InternLM2-20B + InternViT-6B
  vision_seq_tokens: 256,
  links: {
    hf: 'https://huggingface.co/OpenGVLab/InternVL2-26B',
    ms: 'https://modelscope.cn/models/OpenGVLab/InternVL2-26B',
  },
}
