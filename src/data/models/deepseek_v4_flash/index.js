// DeepSeek-V4-Flash: 284B MoE, 13B active, CSA+HCA hybrid attention, 1M context
// Released: April 24, 2026
// Source: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
export default {
  id: 'deepseek_v4_flash',
  name: 'DeepSeek V4 Flash',
  type: 'moe',
  params: 284,
  active_params: 13,
  mla_ratio: null,
  layers: 43,
  kv_heads: 1,
  head_dim: 512,
  hidden_size: 4096,
  max_ctx: 1048576,
  released: '2026-04',
  links: {
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Flash',
  },
}
