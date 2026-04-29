// Yuan 2.0 2B: IEIT's efficient model
// Released: November 2023
// Source: https://huggingface.co/IEITYuan/Yuan2-2B-hf
export default {
  id: 'yuan2_2b',
  released: '2023-11',
  name: 'Yuan 2.0 2B',
  type: 'dense',
  params: 2.0,
  layers: 24,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 2048,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/IEITYuan/Yuan2-2B-hf',
    ms: 'https://modelscope.cn/models/IEITYuan/Yuan2-2B-hf',
  },
}
