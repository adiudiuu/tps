// EXAONE 4.0 32B: dense hybrid SWA/global (LLLG × 16), 64 layers, 128K ctx
// 48 sliding (window=4096) + 16 full attention
// Source: https://huggingface.co/LGAI-EXAONE/EXAONE-4.0-32B/blob/main/config.json
export default {
  id: 'exaone_4_32b',
  name: 'EXAONE 4.0 32B',
  type: 'dense',
  params: 32,
  layers: 64,
  kv_heads: 8,
  head_dim: 128,
  local_layers: 48,
  sliding_window: 4096,
  hidden_size: 5120,
  max_ctx: 131072,
  tags: ['chat', 'reasoning', 'multilingual'],
  released: '2025-07',
  links: {
    hf: 'https://huggingface.co/LGAI-EXAONE/EXAONE-4.0-32B',
  },
}
