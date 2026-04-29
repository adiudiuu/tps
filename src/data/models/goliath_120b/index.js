// Goliath 120B: frankenmerge of two Llama 2 70B models
// Released: November 2023
// Source: https://huggingface.co/alpindale/goliath-120b
export default {
  id: 'goliath_120b',
  released: '2023-11',
  name: 'Goliath 120B',
  type: 'dense',
  params: 120.0,
  layers: 160,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 4096,
  links: {
    ollama: 'ollama pull goliath',
    hf: 'https://huggingface.co/alpindale/goliath-120b',
  },
}
