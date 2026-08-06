// MiMo-V2-Flash: 309B MoE / 15B active, 256 experts top-8, 256K context
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
  kv_heads: 4,
  head_dim: 192,
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
