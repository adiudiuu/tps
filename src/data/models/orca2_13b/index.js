// Orca 2 13B: Microsoft's reasoning-focused model based on Llama 2
// Released: November 2023
// Source: https://huggingface.co/microsoft/Orca-2-13b
export default {
  id: 'orca2_13b',
  released: '2023-11',
  name: 'Orca 2 13B',
  type: 'dense',
  params: 13.0,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 4096,
  links: {
    ollama: 'ollama pull orca2:13b',
    hf: 'https://huggingface.co/microsoft/Orca-2-13b',
  },
}
