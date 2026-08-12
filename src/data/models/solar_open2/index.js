// Solar Open 2: 250B MoE / 15B active, hybrid Softmax+Linear (KDA) attention, 1M context
// Released: 2026-07-22 (Upstage)
// Pattern [Softmax, Linear×3] ×12 → 12 softmax + 36 linear; 320 routed top-8 + 1 shared
// Source: https://huggingface.co/upstage/Solar-Open2-250B/blob/main/config.json
export default {
  id: 'solar_open2',
  name: 'Solar Open 2 (250B-A15B)',
  type: 'moe',
  params: 250,
  active_params: 15,
  experts: 320,
  experts_per_token: 8,
  moe_execution: 'shared_routed',
  layers: 48,
  // 36 KDA linear layers: no standard KV cache (recurrent state)
  local_layers: 36,
  sliding_window: 0,
  linear_attention_layers: 36,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 1048576,
  tags: ['chat', 'reasoning', 'coding', 'multilingual'],
  released: '2026-07',
  links: {
    hf: 'https://huggingface.co/upstage/Solar-Open2-250B',
  },
}
