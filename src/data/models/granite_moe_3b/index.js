// IBM Granite MoE 3B/800M
// Source: https://huggingface.co/ibm-granite/granite-3.0-3b-a800m-instruct/blob/main/config.json
// config: hidden=1536, 24Q/8KV, 32 layers, 40 local experts, top-8
export default {
  id: 'granite_moe_3b',
  released: '2024-10',
  name: 'Granite MoE 3B/800M',
  type: 'moe',
  params: 3.3,
  active_params: 0.8,
  experts: 40,
  experts_per_token: 8,
  mla_ratio: null,
  layers: 32,
  query_heads: 24,
  kv_heads: 8,
  head_dim: 64,
  hidden_size: 1536,
  max_ctx: 131072,
  tags: ['chat'],
  links: {
    hf: 'https://huggingface.co/ibm-granite/granite-3.0-3b-a800m-instruct',
    ms: 'https://modelscope.cn/models/ibm-granite/granite-3.0-3b-a800m-instruct',
  },
}
