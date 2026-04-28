export default {
  id: 'falcon_180b',
  released: '2023-09',
  name: 'Falcon 180B',
  type: 'dense',
  params: 180,
  layers: 80,
  kv_heads: 8,
  head_dim: 64,
  hidden_size: 14848,
  max_ctx: 4096,
  links: {
    ollama: null,
    hf: 'https://huggingface.co/tiiuae/falcon-180B',
    ms: 'https://modelscope.cn/models/AI-ModelScope/falcon-180B',
  },
}
