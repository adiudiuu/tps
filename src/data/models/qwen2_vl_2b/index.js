// Qwen2-VL 2B: compact vision-language model
// Released: August 2024
// Source: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
export default {
  id: 'qwen2_vl_2b',
  released: '2024-08',
  name: 'Qwen2-VL 2B',
  type: 'dense',
  params: 2.0,
  layers: 28,
  kv_heads: 2,
  head_dim: 64,
  hidden_size: 1536,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct',
    ms: 'https://modelscope.cn/models/qwen/Qwen2-VL-2B-Instruct',
  },
}
