// Orca 2 7B: Microsoft's reasoning-focused model based on Llama 2
// Released: November 2023
// Source: https://huggingface.co/microsoft/Orca-2-7b
export default {
  id: 'orca2_7b',
  released: '2023-11',
  name: 'Orca 2 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    ollama: 'ollama pull orca2:7b',
    hf: 'https://huggingface.co/microsoft/Orca-2-7b',
  },
}
