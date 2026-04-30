// DeepSeek-Coder-V2 236B: MoE, 236B total / 21B active, 60 layers, 338 languages, 128K ctx
// Source: https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Instruct
export default {
  id: 'deepseek_coder_v2_236b',
  released: '2024-06',
  name: 'DeepSeek-Coder-V2 236B',
  type: 'moe',
  params: 236,
  active_params: 21,
  experts: 160,
  experts_per_token: 6,
  layers: 60,
  kv_heads: 128,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Instruct',
  },
}
