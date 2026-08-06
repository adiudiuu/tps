// InternVL2 8B: Shanghai AI Lab vision-language model
// Source: https://huggingface.co/OpenGVLab/InternVL2-8B
export default {
  id: 'internvl2_8b',
  released: '2024-07',
  name: 'InternVL2 8B',
  type: 'dense',
  params: 8.1,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 8192,
  tags: ['vision'],
  // vision: InternViT-300M-448px；每 448×448 tile → 256 tokens（pixel shuffle downsample_ratio=0.5）
  // Source: InternVL2 docs / config force_image_size=448, downsample_ratio=0.5
  vision_encoder_params: 0.3,
  vision_seq_tokens: 256,
  links: {
    hf: 'https://huggingface.co/OpenGVLab/InternVL2-8B',
    ms: 'https://modelscope.cn/models/OpenGVLab/InternVL2-8B',
  },
}
