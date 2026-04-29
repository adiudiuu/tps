// OpenHermes Llama 3 8B: fine-tuned on GPT-4 data
// Released: April 2024
// Source: https://huggingface.co/teknium/OpenHermes-2.5-Llama-3-8B
export default {
  id: 'openhermes_llama3_8b',
  released: '2024-04',
  name: 'OpenHermes Llama 3 8B',
  type: 'dense',
  params: 8.0,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/teknium/OpenHermes-2.5-Llama-3-8B',
  },
}
