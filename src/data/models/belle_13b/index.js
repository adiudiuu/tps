// BELLE 13B: larger Chinese instruction model
// Released: April 2023
// Source: https://huggingface.co/BelleGroup/BELLE-LLaMA-13B-2M
export default {
  id: 'belle_13b',
  released: '2023-04',
  name: 'BELLE 13B',
  type: 'dense',
  params: 13.0,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/BelleGroup/BELLE-LLaMA-13B-2M',
    ms: 'https://modelscope.cn/models/BelleGroup/BELLE-LLaMA-13B-2M',
  },
}
