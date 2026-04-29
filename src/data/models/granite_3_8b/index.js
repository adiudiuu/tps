// IBM Granite 3.0 8B: dense, 32 layers, 128K ctx
// Source: https://huggingface.co/ibm-granite/granite-3.0-8b-instruct/blob/main/config.json
export default {
  id: 'granite_3_8b',
  released: '2024-10',
  name: 'Granite 3.0 8B',
  type: 'dense',
  params: 8.0,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/ibm-granite/granite-3.0-8b-instruct',
    ms: 'https://modelscope.cn/models/ibm-granite/granite-3.0-8b-instruct',
  },
}
