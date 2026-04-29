// Upstage SOLAR 10.7B: depth-upscaled from Mistral 7B, 48 layers, 4K ctx
// Source: https://huggingface.co/upstage/SOLAR-10.7B-v1.0/blob/main/config.json
export default {
  id: 'solar_10_7b',
  released: '2023-12',
  name: 'SOLAR 10.7B',
  type: 'dense',
  params: 10.7,
  layers: 48,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/upstage/SOLAR-10.7B-Instruct-v1.0',
    ms: 'https://modelscope.cn/models/upstage/SOLAR-10.7B-Instruct-v1.0',
    ollama: 'https://ollama.com/library/solar',
  },
}
