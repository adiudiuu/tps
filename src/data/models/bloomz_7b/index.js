// BLOOMZ 7.1B: multitask fine-tuned BLOOM
// Released: November 2022
// Source: https://huggingface.co/bigscience/bloomz-7b1
export default {
  id: 'bloomz_7b',
  released: '2022-11',
  name: 'BLOOMZ 7.1B',
  type: 'dense',
  params: 7.1,
  layers: 30,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/bigscience/bloomz-7b1',
  },
}
