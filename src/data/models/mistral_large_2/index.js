// Mistral Large 2 123B: dense, 88 layers, GQA (96 heads / 8 KV heads), 128K ctx
// Source: https://huggingface.co/mistralai/Mistral-Large-Instruct-2407/blob/main/config.json
export default {
  id: 'mistral_large_2',
  released: '2024-07',
  name: 'Mistral Large 2 123B',
  type: 'dense',
  params: 123,
  layers: 88,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 12288,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/mistralai/Mistral-Large-Instruct-2407',
    ms: 'https://modelscope.cn/models/LLM-Research/Mistral-Large-Instruct-2407',
  },
}
