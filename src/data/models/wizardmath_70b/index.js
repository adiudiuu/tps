// WizardMath 70B v1.0: math-specialized model
// Released: August 2023
// Source: https://huggingface.co/WizardLM/WizardMath-70B-V1.0
export default {
  id: 'wizardmath_70b',
  released: '2023-08',
  name: 'WizardMath 70B v1.0',
  type: 'dense',
  params: 70.0,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 4096,
  links: {
    ollama: 'ollama pull wizardmath:70b',
    hf: 'https://huggingface.co/WizardLM/WizardMath-70B-V1.0',
  },
}
