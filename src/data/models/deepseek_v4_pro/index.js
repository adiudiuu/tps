// DeepSeek-V4-Pro: 1.6T MoE, 49B active, CSA+HCA hybrid attention, 1M context
// Released: April 24, 2026
// Source: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
export default {
  id: 'deepseek_v4_pro',
  name: 'DeepSeek V4 Pro',
  type: 'moe',
  params: 1600,
  active_params: 49,
  mla_ratio: null,
  layers: 61,
  kv_heads: 1,
  head_dim: 512,
  hidden_size: 7168,
  max_ctx: 1048576,
  released: '2026-04',
  links: {
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Pro',
  },
}
