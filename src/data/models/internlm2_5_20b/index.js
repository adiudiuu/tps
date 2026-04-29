// InternLM 2.5 20B: dense, 48 layers, GQA (48 heads / 8 KV heads), 1M ctx
// Source: https://huggingface.co/internlm/internlm2_5-20b-chat/blob/main/config.json
export default {
  id: 'internlm2_5_20b',
  released: '2024-07',
  name: 'InternLM 2.5 20B',
  type: 'dense',
  params: 19.9,
  layers: 48,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 6144,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/internlm/internlm2_5-20b-chat',
    ms: 'https://modelscope.cn/models/Shanghai_AI_Laboratory/internlm2_5-20b-chat',
  },
}
