// Phi-4 Reasoning 14B: Microsoft reasoning-focused fine-tune of Phi-4
// Source: https://huggingface.co/microsoft/Phi-4-reasoning
export default {
  id: 'phi4_reasoning_14b',
  released: '2025-04',
  name: 'Phi-4 Reasoning 14B',
  type: 'dense',
  params: 14.0,
  layers: 40,
  kv_heads: 10,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/microsoft/Phi-4-reasoning',
    ollama: 'ollama pull phi4-reasoning',
  },
}
