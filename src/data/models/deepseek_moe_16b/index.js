// DeepSeek-MoE-16B: MoE 16.4B total / 2.8B active, 28 layers, 4K ctx
// First-gen DeepSeek MoE using fine-grained expert architecture
// Source: https://huggingface.co/deepseek-ai/deepseek-moe-16b-chat/blob/main/config.json
export default {
  id: 'deepseek_moe_16b',
  released: '2024-01',
  name: 'DeepSeek-MoE-16B',
  type: 'moe',
  params: 16.4,
  active_params: 2.8,
  mla_ratio: null,
  layers: 28,
  kv_heads: 16,
  head_dim: 128,
  hidden_size: 2048,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/deepseek-ai/deepseek-moe-16b-chat',
    ms: 'https://modelscope.cn/models/deepseek-ai/deepseek-moe-16b-chat',
  },
}
