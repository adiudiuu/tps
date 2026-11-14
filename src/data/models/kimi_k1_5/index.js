// Kimi K1.5: earlier generation model
// Released: October 2024
// Source: https://platform.moonshot.cn/docs/intro
// 无公开 config.json；experts/active 无法核验。calc 在 NE 公式为负时关闭 EP 分片节省。
export default {
  id: 'kimi_k1_5',
  released: '2024-10',
  name: 'Kimi K1.5',
  type: 'moe',
  params: 300,
  active_params: 30,
  experts: 32,
  experts_per_token: 4,
  mla_ratio: null,
  layers: 56,
  kv_heads: 56,
  head_dim: 128,
  hidden_size: 7168,
  max_ctx: 131072,
  tags: ['chat', 'multilingual'],
  links: {
    hf: 'https://huggingface.co/Moonshot',
  },
}
