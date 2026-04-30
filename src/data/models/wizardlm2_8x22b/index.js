// WizardLM 2 8x22B: large MoE model
// Released: April 2024
// Source: https://huggingface.co/microsoft/WizardLM-2-8x22B
export default {
  id: 'wizardlm2_8x22b',
  released: '2024-04',
  name: 'WizardLM 2 8x22B',
  type: 'moe',
  params: 141,
  active_params: 39,
  experts: 8,
  experts_per_token: 2,
  mla_ratio: null,
  layers: 56,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 6144,
  max_ctx: 65536,
  links: {
    hf: 'https://huggingface.co/microsoft/WizardLM-2-8x22B',
  },
}
