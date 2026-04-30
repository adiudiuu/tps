// Kimi K2 Thinking: 基于K2的推理版本，同架构，上下文扩展至256K
// MoE + MLA, 61层, 384路由专家 top-8, 1T总参数, 32B激活
// Source: https://huggingface.co/moonshotai/Kimi-K2-Thinking/blob/main/config.json
export default {
  id: 'kimi_k2_thinking',
  released: '2025-11',
  name: 'Kimi K2 Thinking (MoE)',
  type: 'moe',
  params: 1000,
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
    hf: 'https://huggingface.co/moonshotai/Kimi-K2-Thinking',
    ms: 'https://modelscope.cn/models/moonshotai/Kimi-K2-Thinking',
  },
}
