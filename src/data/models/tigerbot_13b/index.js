// TigerBot 13B: larger Chinese conversational model
// Released: June 2023
// Source: https://huggingface.co/TigerResearch/tigerbot-13b-base
export default {
  id: 'tigerbot_13b',
  released: '2023-06',
  name: 'TigerBot 13B',
  type: 'dense',
  params: 13.0,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/TigerResearch/tigerbot-13b-base',
    ms: 'https://modelscope.cn/models/TigerResearch/tigerbot-13b-base',
  },
}
