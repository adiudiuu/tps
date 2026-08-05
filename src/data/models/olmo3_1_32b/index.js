// OLMo 3.1 32B: dense model with 3:1 sliding-window / full-attention pattern
// Source: https://allenai.org/blog/olmo3
// Config: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct/blob/main/config.json
export default {
  id: 'olmo3_1_32b',
  released: '2025-12',
  name: 'OLMo 3.1 32B',
  type: 'dense',
  params: 32,
  layers: 64,
  local_layers: 48,
  sliding_window: 4096,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 65536,
  tags: ['chat', 'reasoning', 'coding'],
  links: {
    hf: 'https://huggingface.co/allenai/Olmo-3.1-32B-Instruct',
  },
}
