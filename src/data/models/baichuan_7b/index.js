// Baichuan 7B: Chinese-focused base model
// Released: June 2023
// Source: https://huggingface.co/baichuan-inc/Baichuan-7B
export default {
  id: 'baichuan_7b',
  released: '2023-06',
  name: 'Baichuan 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/baichuan-inc/Baichuan-7B',
    ms: 'https://modelscope.cn/models/baichuan-inc/Baichuan-7B',
  },
}
