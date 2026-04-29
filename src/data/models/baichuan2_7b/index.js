// Baichuan 2 7B: improved Chinese model
// Released: September 2023
// Source: https://huggingface.co/baichuan-inc/Baichuan2-7B-Chat
export default {
  id: 'baichuan2_7b',
  released: '2023-09',
  name: 'Baichuan 2 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/baichuan-inc/Baichuan2-7B-Chat',
    ms: 'https://modelscope.cn/models/baichuan-inc/Baichuan2-7B-Chat',
  },
}
