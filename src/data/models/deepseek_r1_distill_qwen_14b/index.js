// DeepSeek-R1-Distill-Qwen-14B: dense, 48 layers, based on Qwen2.5-14B, 128K ctx
// Source: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B/blob/main/config.json
export default {
  id: 'deepseek_r1_distill_qwen_14b',
  released: '2025-01',
  name: 'DeepSeek R1 Distill Qwen 14B',
  type: 'dense',
  params: 14.7,
  layers: 48,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull deepseek-r1:14b',
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B',
  },
}
