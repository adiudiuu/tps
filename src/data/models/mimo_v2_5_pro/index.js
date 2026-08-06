// MiMo-V2.5-Pro: 1.02T MoE / 42B active, 384 experts top-8, 1M context
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
  kv_heads: 8,
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
