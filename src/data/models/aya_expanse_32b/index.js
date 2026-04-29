// Cohere Aya Expanse 32B: dense, 40 layers, 128K ctx
// Source: https://huggingface.co/CohereForAI/aya-expanse-32b/blob/main/config.json
export default {
  id: 'aya_expanse_32b',
  released: '2024-10',
  name: 'Aya Expanse 32B',
  type: 'dense',
  params: 32,
  layers: 40,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/CohereForAI/aya-expanse-32b',
    ms: 'https://modelscope.cn/models/AI-ModelScope/aya-expanse-32b',
  },
}
