// Stable Code 3B: dense, code completion by Stability AI, 16K ctx
// Source: https://huggingface.co/stabilityai/stable-code-3b
export default {
  id: 'stable_code_3b',
  released: '2024-01',
  name: 'Stable Code 3B',
  type: 'dense',
  params: 3,
  layers: 30,
  kv_heads: 1,
  head_dim: 128,
  hidden_size: 2304,
  max_ctx: 16384,
  links: {
    ollama: 'ollama pull stable-code:3b',
    hf: 'https://huggingface.co/stabilityai/stable-code-3b',
  },
}
