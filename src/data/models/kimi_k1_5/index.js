// Kimi K1.5: earlier generation model
// Released: October 2024
// Source: https://platform.moonshot.cn/docs/intro
export default {
  id: 'kimi_k1_5',
  released: '2024-10',
  name: 'Kimi K1.5',
  type: 'moe',
  params: 300,
  active_params: 30,
  mla_ratio: null,
  layers: 56,
  kv_heads: 56,
  head_dim: 128,
  hidden_size: 7168,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/Moonshot',
  },
}
