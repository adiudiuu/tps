// Guanaco 33B: QLoRA fine-tuned Llama
// Released: May 2023
// Source: https://huggingface.co/timdettmers/guanaco-33b-merged
export default {
  id: 'guanaco_33b',
  released: '2023-05',
  name: 'Guanaco 33B',
  type: 'dense',
  params: 33.0,
  layers: 60,
  kv_heads: 52,
  head_dim: 128,
  hidden_size: 6656,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/timdettmers/guanaco-33b-merged',
  },
}
