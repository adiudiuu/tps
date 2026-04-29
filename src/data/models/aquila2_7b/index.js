// Aquila2 7B: improved bilingual model
// Released: October 2023
// Source: https://huggingface.co/BAAI/Aquila2-7B
export default {
  id: 'aquila2_7b',
  released: '2023-10',
  name: 'Aquila2 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/BAAI/Aquila2-7B',
    ms: 'https://modelscope.cn/models/BAAI/Aquila2-7B',
  },
}
