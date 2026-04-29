// Samantha 1.2 Mistral 7B: companion AI fine-tuned from Mistral
// Released: October 2023
// Source: https://huggingface.co/cognitivecomputations/samantha-1.2-mistral-7b
export default {
  id: 'samantha_7b',
  released: '2023-10',
  name: 'Samantha 1.2 Mistral 7B',
  type: 'dense',
  params: 7.2,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 8192,
  links: {
    ollama: 'ollama pull samantha-mistral',
    hf: 'https://huggingface.co/cognitivecomputations/samantha-1.2-mistral-7b',
  },
}
