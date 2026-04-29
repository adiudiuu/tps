// Gemma 2 7B: improved version
// Released: June 2024
// Source: https://huggingface.co/google/gemma-2-7b
export default {
  id: 'gemma2_7b',
  released: '2024-06',
  name: 'Gemma 2 7B',
  type: 'dense',
  params: 9.0,
  layers: 42,
  kv_heads: 4,
  head_dim: 256,
  hidden_size: 3584,
  max_ctx: 8192,
  links: {
    ollama: 'ollama pull gemma2:7b',
    hf: 'https://huggingface.co/google/gemma-2-7b',
  },
}
