// Stable Beluga 13B: larger fine-tuned Llama 2
// Released: July 2023
// Source: https://huggingface.co/stabilityai/StableBeluga-13B
export default {
  id: 'stable_beluga_13b',
  released: '2023-07',
  name: 'Stable Beluga 13B',
  type: 'dense',
  params: 13.0,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/stabilityai/StableBeluga-13B',
  },
}
