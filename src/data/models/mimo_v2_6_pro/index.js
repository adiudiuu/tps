// MiMo-V2.6-Pro-RL: 1.02T MoE / 42B active, 384 experts top-8, native omnimodal, 1M context
// hybrid_layer_pattern: 60 sliding + 10 full；Q=128 两种层型一致，KV=8 两种层型一致
// 官方开源旗舰权重即 -RL checkpoint（MIT，HF 2026-09-21）；backbone 几何同 V2.5-Pro，新增原生视觉/音频
// Source: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL/blob/main/config.json
// Config: num_hidden_layers=70, hidden_size=6144, num_attention_heads=128,
//         num_key_value_heads=8, swa_num_key_value_heads=8, head_dim=192,
//         n_routed_experts=384, num_experts_per_tok=8, n_shared_experts=null,
//         sliding_window=128, max_position_embeddings=1048576
// Vision (vision_config / processor_config): depth=28, hidden=1280, intermediate=4608,
//         patch=16, spatial_merge=2, image_max_pixels=8388608 → 官方 ViT 681M，
//         每图最大 token = 8388608 / 16² / 2² = 8192
export default {
  id: 'mimo_v2_6_pro',
  name: 'MiMo-V2.6-Pro',
  type: 'moe',
  params: 1020,
  active_params: 42,
  experts: 384,
  experts_per_token: 8,
  layers: 70,
  query_heads: 128,      // num_attention_heads；hidden/head_dim 推不出（6144/192=32）
  kv_heads: 8,           // num_key_value_heads = swa_num_key_value_heads = 8
  head_dim: 192,
  hidden_size: 6144,
  local_layers: 60,
  sliding_window: 128,
  max_ctx: 1048576,
  // 官方 681M MiMo ViT（不在 1.02T backbone 内）；音频编码器仅 tags 标注、不建模
  vision_encoder_params: 0.681,
  vision_seq_tokens: 8192,
  tags: ['chat', 'reasoning', 'multilingual', 'coding', 'vision', 'multimodal', 'audio', 'agentic'],
  released: '2026-09',
  links: {
    hf: 'https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL',
    ms: 'https://modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Pro-RL',
  },
}
