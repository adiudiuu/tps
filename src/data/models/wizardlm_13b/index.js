// WizardLM 13B v1.2: instruction-following model
// Released: July 2023
// Source: https://huggingface.co/WizardLM/WizardLM-13B-V1.2
export default {
  id: 'wizardlm_13b',
  released: '2023-07',
  name: 'WizardLM 13B v1.2',
  type: 'dense',
  params: 13.0,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/WizardLM/WizardLM-13B-V1.2',
  },
}
