// LiquidAI LFM2 8B: MoE with 1.5B active, optimized for on-device
// Source: https://huggingface.co/LiquidAI/LFM2-8B-A1B/blob/main/config.json
// config: hidden=2048, 32Q/8KV, 24 layers, 32 experts top-4
export default {
  id: 'liquidai_lfm2_8b',
  released: '2025-02',
  name: 'LiquidAI LFM2 8B',
  type: 'moe',
  params: 8.3,
  active_params: 1.5,
  experts: 32,
  experts_per_token: 4,
  layers: 24,
  query_heads: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 2048,
  max_ctx: 8192,
  tags: ['chat'],

  links: {
    ollama: null,
    hf: 'https://huggingface.co/LiquidAI/LFM2-8B-A1B',
    ms: null
  }
}
