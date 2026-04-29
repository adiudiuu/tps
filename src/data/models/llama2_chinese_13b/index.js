// Llama2-Chinese 13B: LinkSoul's larger Chinese model
// Released: August 2023
// Source: https://huggingface.co/LinkSoul/Chinese-Llama-2-13b
export default {
  id: 'llama2_chinese_13b',
  released: '2023-08',
  name: 'Llama2-Chinese 13B',
  type: 'dense',
  params: 13.0,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/LinkSoul/Chinese-Llama-2-13b',
    ms: 'https://modelscope.cn/models/LinkSoul/Chinese-Llama-2-13b',
  },
}
