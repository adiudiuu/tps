// DeepSeek-R1-Distill-Qwen-7B: dense, 28 layers, based on Qwen2.5-7B, 128K ctx
// Source: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B/blob/main/config.json
export default {
  id: 'deepseek_r1_distill_qwen_7b',
  released: '2025-01',
  name: 'DeepSeek R1 Distill Qwen 7B',
  type: 'dense',
  params: 7.6,
  layers: 28,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 3584,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull deepseek-r1:7b',
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
  },
}
