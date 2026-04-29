// Llama2-Chinese 7B: LinkSoul's Chinese-optimized model
// Released: August 2023
// Source: https://huggingface.co/LinkSoul/Chinese-Llama-2-7b
export default {
  id: 'llama2_chinese_7b',
  released: '2023-08',
  name: 'Llama2-Chinese 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/LinkSoul/Chinese-Llama-2-7b',
    ms: 'https://modelscope.cn/models/LinkSoul/Chinese-Llama-2-7b',
  },
}
