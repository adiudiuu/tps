// Nous Hermes 13B: fine-tuned Llama 2 13B
// Released: July 2023
// Source: https://huggingface.co/NousResearch/Nous-Hermes-llama-2-7b
export default {
  id: 'nous_hermes_13b',
  released: '2023-07',
  name: 'Nous Hermes 13B',
  type: 'dense',
  params: 13.0,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 4096,
  links: {
    ollama: 'ollama pull nous-hermes:13b',
    hf: 'https://huggingface.co/NousResearch/Nous-Hermes-Llama2-13b',
  },
}
