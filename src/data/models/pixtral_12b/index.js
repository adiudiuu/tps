// Pixtral 12B: multimodal vision-language model
// Released: September 2024
// Source: https://huggingface.co/mistralai/Pixtral-12B-2409
export default {
  id: 'pixtral_12b',
  released: '2024-09',
  name: 'Pixtral 12B',
  type: 'dense',
  params: 12.0,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/mistralai/Pixtral-12B-2409',
  },
}
