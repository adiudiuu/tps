// Dolphin 2.6 Mixtral 8x7B: uncensored fine-tune of Mixtral
// Released: January 2024
// Source: https://huggingface.co/cognitivecomputations/dolphin-2.6-mixtral-8x7b
export default {
  id: 'dolphin_mixtral',
  released: '2024-01',
  name: 'Dolphin 2.6 Mixtral 8x7B',
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
    ollama: 'ollama pull dolphin-mixtral',
    hf: 'https://huggingface.co/cognitivecomputations/dolphin-2.6-mixtral-8x7b',
  },
}
