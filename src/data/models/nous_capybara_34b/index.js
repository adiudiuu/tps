// Nous Capybara 34B: fine-tuned Yi 34B with diverse dataset
// Released: December 2023
// Source: https://huggingface.co/NousResearch/Nous-Capybara-34B
export default {
  id: 'nous_capybara_34b',
  released: '2023-12',
  name: 'Nous Capybara 34B',
  type: 'dense',
  params: 34.0,
  layers: 60,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 7168,
  max_ctx: 200000,
  links: {
    ollama: 'ollama pull nous-capybara:34b',
    hf: 'https://huggingface.co/NousResearch/Nous-Capybara-34B',
  },
}
