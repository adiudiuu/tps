// Muse Glimmer 30B: Meta dense VLM, 52 layers, [Local×3 + Global] attention, 128K context
// Perception encoder: ViT-G/14, 50 layers, hidden 1536, patch 14, merge 2
// Official total ≈29.6B (language + vision); Apache 2.0, 2026-08
// Source: https://huggingface.co/meta-models/Muse-Glimmer-30B/blob/main/config.json
export default {
  id: 'muse_glimmer_30b',
  name: 'Muse Glimmer 30B',
  type: 'dense',
  params: 30,
  layers: 52,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 6656,
  local_layers: 39,        // sliding_attention layers (3:1 local:global pattern)
  sliding_window: 2048,
  max_ctx: 131072,
  // ViT-G/14: depth=50, hidden=1536, patch=14, merge=2；官方 ~1.8B
  vision_encoder_params: 1.8,
  vision_encoder_in_params: true, // 30B 为含 perception encoder 的总参数
  vision_seq_tokens: 4096, // max visual tokens per image (model card)
  tags: ['chat', 'reasoning', 'coding', 'vision', 'multimodal', 'agentic'],
  released: '2026-08',
  links: {
    hf: 'https://huggingface.co/meta-models/Muse-Glimmer-30B',
  },
}
