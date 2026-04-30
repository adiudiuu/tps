// Yuan 2.0 51B: IEIT's large MoE model
// Released: February 2024
// Source: https://huggingface.co/IEITYuan/Yuan2-51B-hf
export default {
  id: 'yuan2_51b',
  released: '2024-02',
  name: 'Yuan 2.0 51B',
  type: 'moe',
  params: 51.0,
  active_params: 3.7,
  experts: 16,
  experts_per_token: 2,
  mla_ratio: null,
  layers: 42,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 2048,
  max_ctx: 16384,
  links: {
    hf: 'https://huggingface.co/IEITYuan/Yuan2-51B-hf',
    ms: 'https://modelscope.cn/models/IEITYuan/Yuan2-51B-hf',
  },
}
