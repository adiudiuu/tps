// MiMo-V2.5-Pro: 1.02T MoE / 42B active, 384 experts top-8, 1M context
// hybrid_layer_pattern: 60 sliding + 10 full；Q=128 两种层型一致，KV=8 两种层型一致（与 Flash 的 8/4 拆分不同）
// Source: https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro/blob/main/config.json
export default {
  id: 'mimo_v2_5_pro',
  name: 'MiMo-V2.5-Pro',
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
  tags: ['chat', 'reasoning', 'multilingual'],
  released: '2026-04',
  links: {
    hf: 'https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro',
  },
}
