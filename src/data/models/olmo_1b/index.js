// OLMo 1B: dense, fully open model by Allen AI, 2K ctx
// Source: https://huggingface.co/allenai/OLMo-1B
export default {
  id: 'olmo_1b',
  released: '2024-02',
  name: 'OLMo 1B',
  type: 'dense',
  params: 1,
  layers: 16,
  kv_heads: 16,
  head_dim: 128,
  hidden_size: 2048,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/allenai/OLMo-1B',
  },
}
