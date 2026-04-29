// LG EXAONE 3.5 7.8B: dense, 32 layers, 128K ctx
// Source: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct/blob/main/config.json
export default {
  id: 'exaone_3_5_7_8b',
  released: '2024-12',
  name: 'EXAONE 3.5 7.8B',
  type: 'dense',
  params: 7.8,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct',
    ms: 'https://modelscope.cn/models/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct',
  },
}
