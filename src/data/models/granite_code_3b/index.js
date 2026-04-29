// Granite Code 3B: dense, IBM code model, 116 languages, 128K ctx
// Source: https://huggingface.co/ibm-granite/granite-3b-code-instruct-128k
export default {
  id: 'granite_code_3b',
  released: '2024-05',
  name: 'Granite Code 3B',
  type: 'dense',
  params: 3,
  layers: 28,
  kv_heads: 1,
  head_dim: 128,
  hidden_size: 3072,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull granite-code:3b',
    hf: 'https://huggingface.co/ibm-granite/granite-3b-code-instruct-128k',
  },
}
