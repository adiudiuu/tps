// Seed-OSS-36B: dense, 64 layers, 512K context
// Source: https://huggingface.co/ByteDance-Seed/Seed-OSS-36B-Instruct/blob/main/config.json
export default {
  id: 'seed_oss_36b',
  name: 'Seed-OSS-36B',
  type: 'dense',
  params: 36,
  layers: 64,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 524288,
  tags: ['chat', 'reasoning', 'multilingual'],
  released: '2025-08',
  links: {
    hf: 'https://huggingface.co/ByteDance-Seed/Seed-OSS-36B-Instruct',
  },
}
