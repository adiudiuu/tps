// OLMo 2 7B: dense, 32 layers, 4K ctx
// Source: https://huggingface.co/allenai/OLMo-2-1124-7B/blob/main/config.json
export default {
  id: 'olmo2_7b',
  released: '2024-11',
  name: 'OLMo 2 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/allenai/OLMo-2-1124-7B',
    ms: 'https://modelscope.cn/models/allenai/OLMo-2-1124-7B',
  },
}
