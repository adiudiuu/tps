// WizardLM 2 7B: improved instruction-following
// Released: April 2024
// Source: https://huggingface.co/microsoft/WizardLM-2-7B
export default {
  id: 'wizardlm2_7b',
  released: '2024-04',
  name: 'WizardLM 2 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/microsoft/WizardLM-2-7B',
  },
}
