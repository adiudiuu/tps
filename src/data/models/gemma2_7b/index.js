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
  query_heads: 16, // 与 Gemma 2 9B 同构；unsloth/gemma-2-9b-it num_attention_heads=16
  kv_heads: 8,
  head_dim: 256,
  local_layers: 21,
  sliding_window: 4096,
  hidden_size: 3584,
  max_ctx: 8192,
  tags: ['chat'],

  links: {
    ollama: 'ollama pull gemma2:7b',
    hf: 'https://huggingface.co/google/gemma-2-7b',
  },
}
