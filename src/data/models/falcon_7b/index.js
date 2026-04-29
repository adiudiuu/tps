// Falcon 7B: 32 layers, MQA (71 heads / 1 KV head), 2K ctx
// Source: https://huggingface.co/tiiuae/falcon-7b/blob/main/config.json
export default {
  id: 'falcon_7b',
  released: '2023-03',
  name: 'Falcon 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 1,
  head_dim: 64,
  hidden_size: 4544,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/tiiuae/falcon-7b-instruct',
    ms: 'https://modelscope.cn/models/AI-ModelScope/falcon-7b-instruct',
    ollama: 'https://ollama.com/library/falcon',
  },
}
