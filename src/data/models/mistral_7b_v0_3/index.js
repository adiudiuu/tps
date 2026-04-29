// Mistral 7B v0.3: latest 7B version
// Released: May 2024
// Source: https://huggingface.co/mistralai/Mistral-7B-v0.3
export default {
  id: 'mistral_7b_v0_3',
  released: '2024-05',
  name: 'Mistral 7B v0.3',
  type: 'dense',
  params: 7.2,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 32768,
  links: {
    ollama: 'ollama pull mistral:v0.3',
    hf: 'https://huggingface.co/mistralai/Mistral-7B-v0.3',
  },
}
