// WizardLM 70B v1.0: large instruction-following model
// Released: August 2023
// Source: https://huggingface.co/WizardLM/WizardLM-70B-V1.0
export default {
  id: 'wizardlm_70b',
  released: '2023-08',
  name: 'WizardLM 70B v1.0',
  type: 'dense',
  params: 70.0,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/WizardLM/WizardLM-70B-V1.0',
  },
}
