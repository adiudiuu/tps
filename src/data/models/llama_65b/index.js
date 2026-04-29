// Llama 1 65B: original Meta large model
// Released: February 2023
// Source: https://huggingface.co/huggyllama/llama-65b
export default {
  id: 'llama_65b',
  released: '2023-02',
  name: 'Llama 1 65B',
  type: 'dense',
  params: 65.0,
  layers: 80,
  kv_heads: 64,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/huggyllama/llama-65b',
  },
}
