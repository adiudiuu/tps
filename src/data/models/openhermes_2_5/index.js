// OpenHermes 2.5 Mistral 7B: fine-tuned on 1M+ GPT-4 conversations
// Released: November 2023
// Source: https://huggingface.co/teknium/OpenHermes-2.5-Mistral-7B
export default {
  id: 'openhermes_2_5',
  released: '2023-11',
  name: 'OpenHermes 2.5 Mistral 7B',
  type: 'dense',
  params: 7.2,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 8192,
  links: {
    ollama: 'ollama pull openhermes',
    hf: 'https://huggingface.co/teknium/OpenHermes-2.5-Mistral-7B',
  },
}
