// DeepSeek-R1-Distill-Llama-70B: dense, 80 layers, based on Llama-3.3-70B, 128K ctx
// Source: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-70B/blob/main/config.json
export default {
  id: 'deepseek_r1_distill_llama_70b',
  released: '2025-01',
  name: 'DeepSeek R1 Distill Llama 70B',
  type: 'dense',
  params: 70.6,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull deepseek-r1:70b',
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
  },
}
