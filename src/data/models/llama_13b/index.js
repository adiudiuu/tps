// Llama 1 13B: original Meta model
// Released: February 2023
// Source: https://huggingface.co/huggyllama/llama-13b
export default {
  id: 'llama_13b',
  released: '2023-02',
  name: 'Llama 1 13B',
  type: 'dense',
  params: 13.0,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/huggyllama/llama-13b',
  },
}
