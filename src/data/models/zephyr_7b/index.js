// Zephyr 7B Beta: fine-tuned Mistral 7B with DPO alignment
// Released: October 2023
// Source: https://huggingface.co/HuggingFaceH4/zephyr-7b-beta
export default {
  id: 'zephyr_7b',
  released: '2023-10',
  name: 'Zephyr 7B Beta',
  type: 'dense',
  params: 7.2,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 32768,
  links: {
    ollama: 'ollama pull zephyr',
    hf: 'https://huggingface.co/HuggingFaceH4/zephyr-7b-beta',
  },
}
