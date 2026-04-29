// Llama 1 30B: original Meta model
// Released: February 2023
// Source: https://huggingface.co/huggyllama/llama-30b
export default {
  id: 'llama_30b',
  released: '2023-02',
  name: 'Llama 1 30B',
  type: 'dense',
  params: 30.0,
  layers: 60,
  kv_heads: 52,
  head_dim: 128,
  hidden_size: 6656,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/huggyllama/llama-30b',
  },
}
