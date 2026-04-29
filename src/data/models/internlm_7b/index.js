// InternLM 7B: Shanghai AI Lab's base model
// Released: July 2023
// Source: https://huggingface.co/internlm/internlm-7b
export default {
  id: 'internlm_7b',
  released: '2023-07',
  name: 'InternLM 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/internlm/internlm-7b',
    ms: 'https://modelscope.cn/models/Shanghai_AI_Laboratory/internlm-7b',
  },
}
