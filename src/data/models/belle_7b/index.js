// BELLE 7B: Chinese instruction-following model
// Released: April 2023
// Source: https://huggingface.co/BelleGroup/BELLE-LLaMA-7B-2M
export default {
  id: 'belle_7b',
  released: '2023-04',
  name: 'BELLE 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/BelleGroup/BELLE-LLaMA-7B-2M',
    ms: 'https://modelscope.cn/models/BelleGroup/BELLE-LLaMA-7B-2M',
  },
}
