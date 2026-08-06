// SmolLM3 3B: dense, 36 layers, 64K context
// Source: https://huggingface.co/HuggingFaceTB/SmolLM3-3B/blob/main/config.json
export default {
  id: 'smollm3_3b',
  name: 'SmolLM3 3B',
  type: 'dense',
  params: 3,
  layers: 36,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 2048,
  max_ctx: 65536,
  tags: ['chat', 'multilingual'],
  released: '2025-07',
  links: {
    hf: 'https://huggingface.co/HuggingFaceTB/SmolLM3-3B',
  },
}
