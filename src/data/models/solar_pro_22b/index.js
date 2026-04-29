// Upstage Solar Pro 22B: depth-upscaled from Llama 3, 128K ctx
// Source: https://huggingface.co/upstage/solar-pro-preview-instruct/blob/main/config.json
export default {
  id: 'solar_pro_22b',
  released: '2024-10',
  name: 'Solar Pro 22B',
  type: 'dense',
  params: 22.1,
  layers: 48,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/upstage/solar-pro-preview-instruct',
    ms: 'https://modelscope.cn/models/upstage/solar-pro-preview-instruct',
  },
}
