// Hunyuan-7B: Tencent dense, 32 layers, GQA 32Q/8KV, advertised native 256K ctx
// config.json max_position_embeddings=32768 is the default checkpoint setting
// Source: https://huggingface.co/tencent/Hunyuan-7B-Instruct/blob/main/config.json
export default {
  id: 'hunyuan_7b',
  name: 'Hunyuan 7B',
  type: 'dense',
  params: 7,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 262144,
  tags: ['chat', 'multilingual', 'reasoning'],
  released: '2025-07',
  links: {
    hf: 'https://huggingface.co/tencent/Hunyuan-7B-Instruct',
    ms: 'https://modelscope.cn/models/Tencent-Hunyuan/Hunyuan-7B-Instruct',
  },
}
