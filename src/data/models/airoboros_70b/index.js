// Airoboros L2 70B: self-instruct fine-tuned Llama 2 70B
// Released: September 2023
// Source: https://huggingface.co/jondurbin/airoboros-l2-70b-3.1.2
export default {
  id: 'airoboros_70b',
  released: '2023-09',
  name: 'Airoboros L2 70B',
  type: 'dense',
  params: 70.0,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 4096,
  links: {
    ollama: 'ollama pull airoboros:70b',
    hf: 'https://huggingface.co/jondurbin/airoboros-l2-70b-3.1.2',
  },
}
