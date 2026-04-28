export default {
  id: 'deepseek_v3',
  released: '2024-12',
  name: 'DeepSeek V3',
  type: 'moe',
  params: 671,
  active_params: 37,
  mla_ratio: 0.18,
  layers: 61,
  kv_heads: 128,
  head_dim: 128,
  hidden_size: 7168,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull deepseek-v3',
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-V3',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-V3',
  },
}
