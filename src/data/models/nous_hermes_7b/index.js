// Nous Hermes 7B: fine-tuned Llama 2 7B
// Released: July 2023
// Source: https://huggingface.co/NousResearch/Nous-Hermes-llama-2-7b
export default {
  id: 'nous_hermes_7b',
  released: '2023-07',
  name: 'Nous Hermes 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    ollama: 'ollama pull nous-hermes:7b',
    hf: 'https://huggingface.co/NousResearch/Nous-Hermes-llama-2-7b',
  },
}
