// Pixtral 12B: multimodal vision-language model
// Released: September 2024
// Source: https://huggingface.co/mistralai/Pixtral-12B-2409
export default {
  id: 'pixtral_12b',
  released: '2024-09',
  name: 'Pixtral 12B',
  type: 'dense',
  params: 12.0,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  tags: ['vision'],
  // Pixtral-ViT 400M：patch_size 16；params.json image_size 1024 → 代表性高分辨率约 1024 tokens
  // （满幅 1024×1024 理论 (1024/16)²=4096；与本仓库 pixtral_large 取值对齐）
  // Source: mistralai/Pixtral-12B-2409 params.json + Mistral Pixtral blog
  vision_encoder_params: 0.4,
  vision_seq_tokens: 1024,
  links: {
    hf: 'https://huggingface.co/mistralai/Pixtral-12B-2409',
  },
}
