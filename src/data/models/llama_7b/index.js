// Llama 1 7B: original Meta model
// Released: February 2023
// Source: https://huggingface.co/huggyllama/llama-7b
export default {
  id: 'llama_7b',
  released: '2023-02',
  name: 'Llama 1 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/huggyllama/llama-7b',
  },
}
