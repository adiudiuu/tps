// OLMo 2 13B: dense, 40 layers, 4K ctx
// Source: https://huggingface.co/allenai/OLMo-2-1124-13B/blob/main/config.json
export default {
  id: 'olmo2_13b',
  released: '2024-11',
  name: 'OLMo 2 13B',
  type: 'dense',
  params: 13.0,
  layers: 40,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/allenai/OLMo-2-1124-13B',
    ms: 'https://modelscope.cn/models/allenai/OLMo-2-1124-13B',
  },
}
