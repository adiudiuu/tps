// WizardMath 13B v1.0: math-specialized model
// Released: August 2023
// Source: https://huggingface.co/WizardLM/WizardMath-13B-V1.0
export default {
  id: 'wizardmath_13b',
  released: '2023-08',
  name: 'WizardMath 13B v1.0',
  type: 'dense',
  params: 13.0,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 4096,
  links: {
    ollama: 'ollama pull wizardmath:13b',
    hf: 'https://huggingface.co/WizardLM/WizardMath-13B-V1.0',
  },
}
