// Alpaca 7B: Stanford's instruction-following model
// Released: March 2023
// Source: https://huggingface.co/chavinlo/alpaca-native
export default {
  id: 'alpaca_7b',
  released: '2023-03',
  name: 'Alpaca 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 2048,
  links: {
    ollama: 'ollama pull alpaca',
    hf: 'https://huggingface.co/chavinlo/alpaca-native',
  },
}
