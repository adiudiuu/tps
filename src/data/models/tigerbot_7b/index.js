// TigerBot 7B: Chinese conversational model
// Released: May 2023
// Source: https://huggingface.co/TigerResearch/tigerbot-7b-base
export default {
  id: 'tigerbot_7b',
  released: '2023-05',
  name: 'TigerBot 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/TigerResearch/tigerbot-7b-base',
    ms: 'https://modelscope.cn/models/TigerResearch/tigerbot-7b-base',
  },
}
