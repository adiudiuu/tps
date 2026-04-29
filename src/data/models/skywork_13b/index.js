// Skywork 13B: Kunlun Tech's Chinese model
// Released: October 2023
// Source: https://huggingface.co/Skywork/Skywork-13B-base
export default {
  id: 'skywork_13b',
  released: '2023-10',
  name: 'Skywork 13B',
  type: 'dense',
  params: 13.0,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/Skywork/Skywork-13B-base',
    ms: 'https://modelscope.cn/models/skywork/Skywork-13B-base',
  },
}
