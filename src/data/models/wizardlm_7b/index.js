// WizardLM 7B v1.0: instruction-following model
// Released: April 2023
// Source: https://huggingface.co/WizardLM/WizardLM-7B-V1.0
export default {
  id: 'wizardlm_7b',
  released: '2023-04',
  name: 'WizardLM 7B v1.0',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/WizardLM/WizardLM-7B-V1.0',
  },
}
