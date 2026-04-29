// WizardCoder 33B: dense, Evol-Instruct fine-tuned CodeLlama
// Source: https://huggingface.co/WizardLM/WizardCoder-33B-V1.1
export default {
  id: 'wizardcoder_33b',
  released: '2023-08',
  name: 'WizardCoder 33B',
  type: 'dense',
  params: 33,
  layers: 60,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 16384,
  links: {
    hf: 'https://huggingface.co/WizardLM/WizardCoder-33B-V1.1',
  },
}
