// Aquila 7B: BAAI's bilingual model
// Released: June 2023
// Source: https://huggingface.co/BAAI/Aquila-7B
export default {
  id: 'aquila_7b',
  released: '2023-06',
  name: 'Aquila 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/BAAI/Aquila-7B',
    ms: 'https://modelscope.cn/models/BAAI/Aquila-7B',
  },
}
