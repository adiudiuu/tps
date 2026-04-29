// Guanaco 13B: QLoRA fine-tuned Llama
// Released: May 2023
// Source: https://huggingface.co/timdettmers/guanaco-13b
export default {
  id: 'guanaco_13b',
  released: '2023-05',
  name: 'Guanaco 13B',
  type: 'dense',
  params: 13.0,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/timdettmers/guanaco-13b',
  },
}
