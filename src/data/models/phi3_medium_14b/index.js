// Phi-3 Medium 14B: dense, small language model, 128K ctx
// Source: https://huggingface.co/microsoft/Phi-3-medium-128k-instruct
export default {
  id: 'phi3_medium_14b',
  released: '2024-05',
  name: 'Phi-3 Medium 14B',
  type: 'dense',
  params: 14,
  layers: 40,
  kv_heads: 10,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull phi3:medium',
    hf: 'https://huggingface.co/microsoft/Phi-3-medium-128k-instruct',
  },
}
