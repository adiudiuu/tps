// Falcon 40B: 60 layers, GQA (128 heads / 8 KV heads), 2K ctx
// Source: https://huggingface.co/tiiuae/falcon-40b/blob/main/config.json
export default {
  id: 'falcon_40b',
  released: '2023-05',
  name: 'Falcon 40B',
  type: 'dense',
  params: 40.4,
  layers: 60,
  kv_heads: 8,
  head_dim: 64,
  hidden_size: 8192,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/tiiuae/falcon-40b-instruct',
    ms: 'https://modelscope.cn/models/AI-ModelScope/falcon-40b-instruct',
  },
}
