// Falcon 3 7B: dense, 32 layers, GQA (32 heads / 8 KV heads), 32K ctx
// Source: https://huggingface.co/tiiuae/Falcon3-7B-Instruct/blob/main/config.json
export default {
  id: 'falcon3_7b',
  released: '2024-11',
  name: 'Falcon 3 7B',
  type: 'dense',
  params: 7.5,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/tiiuae/Falcon3-7B-Instruct',
    ms: 'https://modelscope.cn/models/tiiuae/Falcon3-7B-Instruct',
  },
}
