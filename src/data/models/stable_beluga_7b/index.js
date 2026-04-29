// Stable Beluga 7B: fine-tuned Llama 2
// Released: July 2023
// Source: https://huggingface.co/stabilityai/StableBeluga-7B
export default {
  id: 'stable_beluga_7b',
  released: '2023-07',
  name: 'Stable Beluga 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/stabilityai/StableBeluga-7B',
  },
}
