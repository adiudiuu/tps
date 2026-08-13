// Magistral Small 2509: Mistral reasoning 24B (Mistral3 text + Pixtral vision)
// Text geometry matches Mistral Small 3.1 24B
// Source: https://huggingface.co/mistralai/Magistral-Small-2509/blob/main/config.json
export default {
  id: 'magistral_small_24b',
  name: 'Magistral Small 24B',
  type: 'dense',
  params: 24,
  layers: 40,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 131072,
  tags: ['chat', 'reasoning', 'vision', 'multimodal'],
  // HF config.json: Pixtral ViT, image_size 1540 / patch_size 14 = 110, spatial_merge_size 2 → 55×55
  vision_encoder_params: 0.4, // ~400M Pixtral vision encoder（与 Leanstral / Mistral Small 4 同架构）
  vision_seq_tokens: 3025,
  released: '2025-09',
  links: {
    hf: 'https://huggingface.co/mistralai/Magistral-Small-2509',
  },
}
