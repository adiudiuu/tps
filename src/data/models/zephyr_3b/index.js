// Zephyr 3B: compact DPO-aligned model
// Released: November 2023
// Source: https://huggingface.co/HuggingFaceH4/zephyr-3b-beta
export default {
  id: 'zephyr_3b',
  released: '2023-11',
  name: 'Zephyr 3B Beta',
  type: 'dense',
  params: 3.0,
  layers: 16,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/HuggingFaceH4/zephyr-3b-beta',
  },
}
