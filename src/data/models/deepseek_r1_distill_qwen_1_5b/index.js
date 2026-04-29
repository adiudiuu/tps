// DeepSeek R1 Distill Qwen 1.5B: compact distilled reasoning model
// Released: January 2025
// Source: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
export default {
  id: 'deepseek_r1_distill_qwen_1_5b',
  released: '2025-01',
  name: 'DeepSeek R1 Distill Qwen 1.5B',
  type: 'dense',
  params: 1.5,
  layers: 28,
  kv_heads: 2,
  head_dim: 64,
  hidden_size: 1536,
  max_ctx: 32768,
  links: {
    ollama: 'ollama pull deepseek-r1:1.5b',
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',
  },
}
