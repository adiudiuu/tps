// Kimi K2.5: 原生多模态版本，基于K2-Base继续预训练，约15T混合视觉+文本token
// MoE + MLA, 61层, 384路由专家 top-8, 1.04T总参数, 32B激活, 256K上下文
// Source: https://huggingface.co/moonshotai/Kimi-K2.5/blob/main/config.json
export default {
  id: 'kimi_k2_5',
  released: '2026-01',
  name: 'Kimi K2.5 (MoE)',
  type: 'moe',
  params: 1040,
  active_params: 32,
  experts: 384,
  experts_per_token: 8,
  mla_ratio: 0.18,
  layers: 61,
  kv_heads: 1,
  head_dim: 512,
  hidden_size: 7168,
  max_ctx: 262144,
  links: {
    hf: 'https://huggingface.co/moonshotai/Kimi-K2.5',
    ms: 'https://modelscope.cn/models/moonshotai/Kimi-K2.5',
  },
}
