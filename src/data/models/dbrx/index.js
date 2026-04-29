// DBRX: MoE, 40 layers, GQA (48 heads / 8 KV heads), 16 experts (4 active), 32K ctx
// Source: https://huggingface.co/databricks/dbrx-instruct/blob/main/config.json
export default {
  id: 'dbrx',
  released: '2024-03',
  name: 'DBRX 132B',
  type: 'moe',
  params: 132,
  active_params: 36,
  mla_ratio: null,
  layers: 40,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 6144,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/databricks/dbrx-instruct',
    ms: 'https://modelscope.cn/models/AI-ModelScope/dbrx-instruct',
  },
}
