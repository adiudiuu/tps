// DeepSeek R1: same architecture as DeepSeek V3, trained with RL for reasoning
// Released: January 2025
// Source: https://huggingface.co/deepseek-ai/DeepSeek-R1
export default {
  id: 'deepseek_r1',
  name: 'DeepSeek R1',
  type: 'moe',
  params: 671,
  active_params: 37,
  mla_ratio: 0.18,
  layers: 61,
  kv_heads: 128,
  head_dim: 128,
  hidden_size: 7168,
  max_ctx: 131072,
  released: '2025-01',
  links: {
    ollama: 'ollama pull deepseek-r1:671b',
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-R1',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-R1',
  },
}
