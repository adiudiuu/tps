// Mistral Medium 3.5 128B: dense multimodal model, 88 layers, 256K context
// Source: https://huggingface.co/mistralai/Mistral-Medium-3.5-128B/blob/main/config.json
export default {
  id: 'mistral_medium_3_5_128b',
  name: 'Mistral Medium 3.5 128B',
  type: 'dense',
  params: 128,
  layers: 88,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 12288,
  max_ctx: 262144,
  tags: ['chat', 'multilingual', 'vision', 'multimodal'],
  // vision_config: image_size 1540 / patch_size 14 = 110，spatial_merge_size 2 → 55×55 = 3025
  // Source: HF config.json（与 Leanstral 1.5 / Mistral Small 4 同构 Pixtral vision）
  vision_encoder_params: 0.4,
  vision_seq_tokens: 3025,
  released: '2026-04',
  links: {
    hf: 'https://huggingface.co/mistralai/Mistral-Medium-3.5-128B',
  },
}
