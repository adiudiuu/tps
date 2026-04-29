// DeepSeek-LLM-67B: 95 layers, GQA (64 heads / 8 KV heads), 4K ctx
// Source: https://huggingface.co/deepseek-ai/deepseek-llm-67b-chat/blob/main/config.json
export default {
  id: 'deepseek_llm_67b',
  released: '2023-11',
  name: 'DeepSeek-LLM 67B',
  type: 'dense',
  params: 67.0,
  layers: 95,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/deepseek-ai/deepseek-llm-67b-chat',
    ms: 'https://modelscope.cn/models/deepseek-ai/deepseek-llm-67b-chat',
  },
}
