// Gemma 7B: Google's open model
// Released: February 2024
// Source: https://huggingface.co/google/gemma-7b
export default {
  id: 'gemma_7b',
  released: '2024-02',
  name: 'Gemma 7B',
  type: 'dense',
  params: 8.5,
  layers: 28,
  kv_heads: 16,
  head_dim: 256,
  hidden_size: 3072,
  max_ctx: 8192,
  links: {
    ollama: 'ollama pull gemma:7b',
    hf: 'https://huggingface.co/google/gemma-7b',
  },
}
