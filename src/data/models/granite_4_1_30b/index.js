// Granite 4.1 30B: dense, 64 layers, 128K context
// Source: https://huggingface.co/ibm-granite/granite-4.1-30b/blob/main/config.json
export default {
  id: 'granite_4_1_30b',
  name: 'Granite 4.1 30B',
  type: 'dense',
  params: 30,
  layers: 64,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  tags: ['chat', 'multilingual'],
  released: '2026-04',
  links: {
    hf: 'https://huggingface.co/ibm-granite/granite-4.1-30b',
  },
}
