// Nous Hermes 2 Mixtral 8x7B: fine-tuned Mixtral with diverse dataset
// Released: January 2024
// Source: https://huggingface.co/NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO
export default {
  id: 'nous_hermes2_mixtral',
  released: '2024-01',
  name: 'Nous Hermes 2 Mixtral 8x7B',
  type: 'moe',
  params: 46.7,
  active_params: 12.9,
  mla_ratio: null,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 32768,
  links: {
    ollama: 'ollama pull nous-hermes2-mixtral',
    hf: 'https://huggingface.co/NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
  },
}
