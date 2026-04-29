// Guanaco 7B: QLoRA fine-tuned Llama
// Released: May 2023
// Source: https://huggingface.co/timdettmers/guanaco-7b
export default {
  id: 'guanaco_7b',
  released: '2023-05',
  name: 'Guanaco 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/timdettmers/guanaco-7b',
  },
}
