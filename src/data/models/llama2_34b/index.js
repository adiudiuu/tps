// Llama 2 34B: code-focused variant
// Released: July 2023
// Source: https://huggingface.co/codellama/CodeLlama-34b-hf
export default {
  id: 'llama2_34b',
  released: '2023-07',
  name: 'Llama 2 34B',
  type: 'dense',
  params: 34.0,
  layers: 48,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/codellama/CodeLlama-34b-hf',
  },
}
