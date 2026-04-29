// InternLM 20B: Shanghai AI Lab's large model
// Released: September 2023
// Source: https://huggingface.co/internlm/internlm-20b
export default {
  id: 'internlm_20b',
  released: '2023-09',
  name: 'InternLM 20B',
  type: 'dense',
  params: 20.0,
  layers: 60,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 16384,
  links: {
    hf: 'https://huggingface.co/internlm/internlm-20b',
    ms: 'https://modelscope.cn/models/Shanghai_AI_Laboratory/internlm-20b',
  },
}
