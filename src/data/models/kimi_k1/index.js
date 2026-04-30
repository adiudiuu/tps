// Kimi K1: first generation model
// Released: March 2024
// Source: https://platform.moonshot.cn/docs/intro
export default {
  id: 'kimi_k1',
  released: '2024-03',
  name: 'Kimi K1',
  type: 'moe',
  params: 200,
  active_params: 20,
  experts: 32,
  experts_per_token: 4,
  mla_ratio: null,
  layers: 48,
  kv_heads: 48,
  head_dim: 128,
  hidden_size: 6144,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/Moonshot',
  },
}
