// OLMo 3 7B: dense model with 3:1 sliding-window / full-attention pattern
// Source: https://allenai.org/blog/olmo3
// Config: https://huggingface.co/allenai/Olmo-3-7B-Instruct/blob/main/config.json
export default {
  id: 'olmo3_7b',
  released: '2025-11',
  name: 'OLMo 3 7B',
  type: 'dense',
  params: 7,
  layers: 32,
  local_layers: 24,
  sliding_window: 4096,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 65536,
  tags: ['chat', 'reasoning', 'coding'],
  links: {
    hf: 'https://huggingface.co/allenai/Olmo-3-7B-Instruct',
  },
}
