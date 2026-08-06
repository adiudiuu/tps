// DeepSeek V3.1: improved version with better performance
// Released: March 2025
// Source: https://huggingface.co/deepseek-ai/DeepSeek-V3.1
export default {
  id: 'deepseek_v3_1',
  released: '2025-03',
  name: 'DeepSeek V3.1',
  type: 'moe',
  params: 671,
  active_params: 37,
  experts: 256,
  experts_per_token: 8,
  moe_execution: 'shared_routed',
  // MLA latent = kv_lora_rank(512) + qk_rope_head_dim(64) = 576，基线 2 × 128 × 128 = 32768
  mla_ratio: 0.0176,
  layers: 61,
  kv_heads: 128,
  head_dim: 128,
  hidden_size: 7168,
  max_ctx: 131072,
  tags: ['chat', 'multilingual'],
  links: {
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-V3.1',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-V3.1',
  },
}
