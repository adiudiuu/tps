// BlueLM-v2 7B: vivo's Chinese model
// Released: November 2023
// Source: https://huggingface.co/vivo-ai/BlueLM-7B-Chat
export default {
  id: 'bluelmv2_7b',
  released: '2023-11',
  name: 'BlueLM-v2 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/vivo-ai/BlueLM-7B-Chat',
    ms: 'https://modelscope.cn/models/vivo-ai/BlueLM-7B-Chat',
  },
}
