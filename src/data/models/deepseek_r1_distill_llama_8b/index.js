// DeepSeek-R1-Distill-Llama-8B: dense, 32 layers, based on Llama-3.1-8B, 128K ctx
// Source: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B/blob/main/config.json
export default {
  id: 'deepseek_r1_distill_llama_8b',
  released: '2025-01',
  name: 'DeepSeek R1 Distill Llama 8B',
  type: 'dense',
  params: 8.0,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull deepseek-r1:8b',
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Llama-8B',
  },
}
