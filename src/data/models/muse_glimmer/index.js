// Muse Glimmer: ~29.6B dense multimodal (28B text + ~1.8B ViT-G/14), hybrid SWA/global, 128K ctx
// Released: 2026-08-11
// Attention pattern [Local×3, Global] ×13 = 39 sliding (window=2048) + 13 global
// Source: https://huggingface.co/meta-models/Muse-Glimmer-30B/blob/main/config.json
export default {
  id: 'muse_glimmer',
  name: 'Muse Glimmer 30B',
  type: 'dense',
  params: 29.6,
  layers: 52,
  kv_heads: 2,
  head_dim: 128,
  local_layers: 39,
  sliding_window: 2048,
  hidden_size: 6656,
  max_ctx: 131072,
  // ViT-G/14 perception encoder ~1.8B; max visual tokens per image from model card
  vision_encoder_params: 1.8,
  vision_encoder_in_params: true, // 官方 29.6B 含 ~1.8B ViT-G/14，不再另加视觉权重
  vision_seq_tokens: 4096,
  tags: ['chat', 'vision', 'multimodal', 'coding'],
  released: '2026-08',
  links: {
    hf: 'https://huggingface.co/meta-models/Muse-Glimmer-30B',
  },
}
