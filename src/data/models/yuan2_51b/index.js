// Yuan 2.0 51B: dense transformer（HF config 无 experts 字段，不是 MoE）
// Source: https://huggingface.co/IEITYuan/Yuan2-51B-hf/blob/main/config.json
// config: hidden=8192, 64 heads (MHA), 42 layers, intermediate=32768
export default {
  id: 'yuan2_51b',
  released: '2024-02',
  name: 'Yuan 2.0 51B',
  type: 'dense',
  params: 51.0,
  layers: 42,
  query_heads: 64,
  kv_heads: 64,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 16384,
  tags: ['chat', 'multilingual'],
  links: {
    hf: 'https://huggingface.co/IEITYuan/Yuan2-51B-hf',
    ms: 'https://modelscope.cn/models/IEITYuan/Yuan2-51B-hf',
  },
}
