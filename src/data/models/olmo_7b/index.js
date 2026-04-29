// OLMo 7B: dense, fully open model by Allen AI, 2K ctx
// Source: https://huggingface.co/allenai/OLMo-7B
export default {
  id: 'olmo_7b',
  released: '2024-02',
  name: 'OLMo 7B',
  type: 'dense',
  params: 7,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/allenai/OLMo-7B',
  },
}
