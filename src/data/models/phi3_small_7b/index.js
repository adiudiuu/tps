// Phi-3 Small 7B: dense, small language model, 128K ctx
// Source: https://huggingface.co/microsoft/Phi-3-small-128k-instruct
export default {
  id: 'phi3_small_7b',
  released: '2024-05',
  name: 'Phi-3 Small 7B',
  type: 'dense',
  params: 7,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull phi3:small',
    hf: 'https://huggingface.co/microsoft/Phi-3-small-128k-instruct',
  },
}
