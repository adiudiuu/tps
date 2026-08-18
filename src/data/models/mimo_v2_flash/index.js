// MiMo-V2-Flash: 309B MoE / 15B active, 256 experts top-8, hybrid SWA/global, 256K context
// hybrid_layer_pattern: 39 sliding + 9 full; SWA KV=8, full KV=4
// Source: https://huggingface.co/XiaomiMiMo/MiMo-V2-Flash/blob/main/config.json
export default {
  id: 'mimo_v2_flash',
  name: 'MiMo-V2-Flash',
  type: 'moe',
  params: 309,
  active_params: 15,
  experts: 256,
  experts_per_token: 8,
  layers: 48,
  query_heads: 64,       // Q=64 两种层型一致；hidden/head_dim 推不出（4096/192≈21）
  kv_heads: 8,           // SWA (swa_num_key_value_heads)
  head_dim: 192,
  global_kv_heads: 4,    // full (num_key_value_heads)
  global_head_dim: 192,
  hidden_size: 4096,
  local_layers: 39,
  sliding_window: 128,
  max_ctx: 262144,
  tags: ['chat', 'reasoning', 'multilingual'],
  released: '2025-12',
  links: {
    hf: 'https://huggingface.co/XiaomiMiMo/MiMo-V2-Flash',
  },
}
