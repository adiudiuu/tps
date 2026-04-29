// Granite Code 8B: dense, IBM code model, 116 languages, 128K ctx
// Source: https://huggingface.co/ibm-granite/granite-8b-code-instruct-128k
export default {
  id: 'granite_code_8b',
  released: '2024-05',
  name: 'Granite Code 8B',
  type: 'dense',
  params: 8,
  layers: 36,
  kv_heads: 1,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull granite-code:8b',
    hf: 'https://huggingface.co/ibm-granite/granite-8b-code-instruct-128k',
  },
}
