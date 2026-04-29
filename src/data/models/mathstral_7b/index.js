// Mathstral 7B: math-specialized Mistral
// Released: July 2024
// Source: https://huggingface.co/mistralai/mathstral-7B-v0.1
export default {
  id: 'mathstral_7b',
  released: '2024-07',
  name: 'Mathstral 7B',
  type: 'dense',
  params: 7.2,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/mistralai/mathstral-7B-v0.1',
  },
}
