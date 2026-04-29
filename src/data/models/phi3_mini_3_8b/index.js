// Phi-3 Mini 3.8B: dense, small language model, 128K ctx
// Source: https://huggingface.co/microsoft/Phi-3-mini-128k-instruct
export default {
  id: 'phi3_mini_3_8b',
  released: '2024-04',
  name: 'Phi-3 Mini 3.8B',
  type: 'dense',
  params: 3.8,
  layers: 32,
  kv_heads: 32,
  head_dim: 96,
  hidden_size: 3072,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull phi3:mini',
    hf: 'https://huggingface.co/microsoft/Phi-3-mini-128k-instruct',
  },
}
