// Qwen2.5-VL 72B: Alibaba large vision-language model
// Source: https://huggingface.co/Qwen/Qwen2.5-VL-72B-Instruct
export default {
  id: 'qwen25_vl_72b',
  released: '2025-01',
  name: 'Qwen2.5-VL 72B',
  type: 'dense',
  params: 72.7,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen2.5-VL-72B-Instruct',
    ms: 'https://modelscope.cn/models/Qwen/Qwen2.5-VL-72B-Instruct',
    ollama: 'ollama pull qwen2.5vl:72b',
  },
}
