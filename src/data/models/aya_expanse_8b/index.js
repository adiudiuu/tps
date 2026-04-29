// Cohere Aya Expanse 8B: dense, 32 layers, 8K ctx
// Source: https://huggingface.co/CohereForAI/aya-expanse-8b/blob/main/config.json
export default {
  id: 'aya_expanse_8b',
  released: '2024-10',
  name: 'Aya Expanse 8B',
  type: 'dense',
  params: 8.0,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/CohereForAI/aya-expanse-8b',
    ms: 'https://modelscope.cn/models/AI-ModelScope/aya-expanse-8b',
  },
}
