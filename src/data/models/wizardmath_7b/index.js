// WizardMath 7B v1.0: math-specialized model
// Released: August 2023
// Source: https://huggingface.co/WizardLM/WizardMath-7B-V1.0
export default {
  id: 'wizardmath_7b',
  released: '2023-08',
  name: 'WizardMath 7B v1.0',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    ollama: 'ollama pull wizardmath:7b',
    hf: 'https://huggingface.co/WizardLM/WizardMath-7B-V1.0',
  },
}
