// WizardCoder 15B: dense, Evol-Instruct fine-tuned StarCoder
// Source: https://huggingface.co/WizardLM/WizardCoder-15B-V1.0
export default {
  id: 'wizardcoder_15b',
  released: '2023-06',
  name: 'WizardCoder 15B',
  type: 'dense',
  params: 15,
  layers: 40,
  kv_heads: 1,
  head_dim: 128,
  hidden_size: 6144,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/WizardLM/WizardCoder-15B-V1.0',
  },
}
