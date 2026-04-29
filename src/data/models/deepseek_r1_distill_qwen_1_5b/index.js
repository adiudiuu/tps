// DeepSeek R1 Distill Qwen 1.5B: distilled from DeepSeek-R1, Qwen2.5-1.5B architecture
// Source: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B/blob/main/config.json
export default {
  id: 'deepseek_r1_distill_qwen_1_5b',
  released: '2025-01',
  name: 'R1-Distill-Qwen-1.5B',
  type: 'dense',
  params: 1.5,
  layers: 28,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 1536,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',
    ollama: 'https://ollama.com/library/deepseek-r1:1.5b',
  },
}
