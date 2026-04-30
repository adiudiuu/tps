// IBM Granite MoE 3B/800M: 8 experts (2 active), 40 layers, 128K ctx
// Source: https://huggingface.co/ibm-granite/granite-3.0-3b-a800m-instruct/blob/main/config.json
export default {
  id: 'granite_moe_3b',
  released: '2024-10',
  name: 'Granite MoE 3B/800M',
  type: 'moe',
  params: 3.3,
  active_params: 0.8,
  experts: 8,
  experts_per_token: 2,
  mla_ratio: null,
  layers: 40,
  kv_heads: 8,
  head_dim: 64,
  hidden_size: 1024,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/ibm-granite/granite-3.0-3b-a800m-instruct',
    ms: 'https://modelscope.cn/models/ibm-granite/granite-3.0-3b-a800m-instruct',
  },
}
