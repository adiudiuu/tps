// DeepSeek R1-0528: latest reasoning model checkpoint
// Released: May 2025
// Source: https://huggingface.co/deepseek-ai/DeepSeek-R1-0528
export default {
  id: 'deepseek_r1_0528',
  released: '2025-05',
  name: 'DeepSeek R1-0528',
  type: 'moe',
  params: 671,
  active_params: 37,
  mla_ratio: 0.18,
  layers: 61,
  kv_heads: 128,
  head_dim: 128,
  hidden_size: 7168,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-R1-0528',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-R1-0528',
  },
}
