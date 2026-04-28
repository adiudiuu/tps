// Kimi K2.6: 1T MoE, 32B active, MLA attention, 256K context
// Released: April 2026
// Source: https://huggingface.co/moonshotai/Kimi-K2.6
export default {
  id: 'kimi_k2_6',
  name: 'Kimi K2.6 (MoE)',
  type: 'moe',
  params: 1000,
  active_params: 32,
  layers: 61,
  kv_heads: 1,
  head_dim: 512,
  hidden_size: 7168,
  max_ctx: 262144,
  released: '2026-04',
  links: {
    hf: 'https://huggingface.co/moonshotai/Kimi-K2.6',
    ms: 'https://modelscope.cn/models/moonshotai/Kimi-K2.6',
  },
}
