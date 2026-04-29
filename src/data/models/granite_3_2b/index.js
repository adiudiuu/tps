// IBM Granite 3.0 2B: dense, 24 layers, 128K ctx
// Source: https://huggingface.co/ibm-granite/granite-3.0-2b-instruct/blob/main/config.json
export default {
  id: 'granite_3_2b',
  released: '2024-10',
  name: 'Granite 3.0 2B',
  type: 'dense',
  params: 2.0,
  layers: 24,
  kv_heads: 8,
  head_dim: 64,
  hidden_size: 2048,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/ibm-granite/granite-3.0-2b-instruct',
    ms: 'https://modelscope.cn/models/ibm-granite/granite-3.0-2b-instruct',
  },
}
