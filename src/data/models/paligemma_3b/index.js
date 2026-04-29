// PaliGemma 3B: vision-language model
// Released: May 2024
// Source: https://huggingface.co/google/paligemma-3b-pt-224
export default {
  id: 'paligemma_3b',
  released: '2024-05',
  name: 'PaliGemma 3B',
  type: 'dense',
  params: 3.0,
  layers: 26,
  kv_heads: 16,
  head_dim: 256,
  hidden_size: 2048,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/google/paligemma-3b-pt-224',
  },
}
