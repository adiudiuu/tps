// CodeGen2.5 7B: dense, multi-turn conversation, 8K ctx
// Source: https://huggingface.co/Salesforce/codegen25-7b-instruct
export default {
  id: 'codegen2_5_7b',
  released: '2023-05',
  name: 'CodeGen2.5 7B',
  type: 'dense',
  params: 7,
  layers: 32,
  kv_heads: 16,
  head_dim: 256,
  hidden_size: 4096,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/Salesforce/codegen25-7b-instruct',
  },
}
