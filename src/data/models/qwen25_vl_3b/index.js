// Qwen2.5-VL 3B: Alibaba vision-language model
// Source: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
export default {
  id: 'qwen25_vl_3b',
  released: '2025-01',
  name: 'Qwen2.5-VL 3B',
  type: 'dense',
  params: 3.7,
  layers: 28,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 2048,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct',
    ms: 'https://modelscope.cn/models/Qwen/Qwen2.5-VL-3B-Instruct',
    ollama: 'ollama pull qwen2.5vl:3b',
  },
}
