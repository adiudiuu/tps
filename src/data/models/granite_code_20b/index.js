// Granite Code 20B: dense, IBM code model, 116 languages, 128K ctx
// Source: https://huggingface.co/ibm-granite/granite-20b-code-instruct
export default {
  id: 'granite_code_20b',
  released: '2024-05',
  name: 'Granite Code 20B',
  type: 'dense',
  params: 20,
  layers: 52,
  kv_heads: 1,
  head_dim: 128,
  hidden_size: 6144,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull granite-code:20b',
    hf: 'https://huggingface.co/ibm-granite/granite-20b-code-instruct',
  },
}
