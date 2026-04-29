// Granite Code 34B: dense, IBM code model, 116 languages, 128K ctx
// Source: https://huggingface.co/ibm-granite/granite-34b-code-instruct
export default {
  id: 'granite_code_34b',
  released: '2024-05',
  name: 'Granite Code 34B',
  type: 'dense',
  params: 34,
  layers: 88,
  kv_heads: 1,
  head_dim: 128,
  hidden_size: 6144,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull granite-code:34b',
    hf: 'https://huggingface.co/ibm-granite/granite-34b-code-instruct',
  },
}
