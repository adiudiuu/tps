// Nous Hermes 2 Llama 3 8B: fine-tuned Llama 3
// Released: April 2024
// Source: https://huggingface.co/NousResearch/Hermes-2-Pro-Llama-3-8B
export default {
  id: 'nous_hermes2_llama3_8b',
  released: '2024-04',
  name: 'Nous Hermes 2 Llama 3 8B',
  type: 'dense',
  params: 8.0,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 8192,
  links: {
    ollama: 'ollama pull nous-hermes2-llama3',
    hf: 'https://huggingface.co/NousResearch/Hermes-2-Pro-Llama-3-8B',
  },
}
