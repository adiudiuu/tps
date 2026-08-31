// GLM-5.3: 753B MoE / 40B active, same base as GLM-5.2 + post-train upgrade, IndexShare DSA, 1M context
// Source: https://huggingface.co/zai-org/GLM-5.3
// Config: https://huggingface.co/zai-org/GLM-5.3/blob/main/config.json
export default {
  id: 'glm5_3',
  released: '2026-08',
  name: 'GLM-5.3 (753B-A40B)',
  type: 'moe',
  params: 753,
  active_params: 40,
  experts: 256,
  experts_per_token: 8,
  moe_execution: 'shared_routed',
  // MLA：每 token 每层只缓存 kv_lora_rank(512) + qk_rope_head_dim(64) = 576 个元素，
  // 而 calc.js 的基线按 2 × kv_heads(64) × head_dim(192) = 24576 计算
  mla_ratio: 0.0234,  // 576 / 24576
  layers: 78,
  kv_heads: 64,
  head_dim: 192,
  hidden_size: 6144,
  max_ctx: 1048576,
  tags: ['chat', 'reasoning', 'coding', 'multilingual', 'agentic'],
  links: {
    hf: 'https://huggingface.co/zai-org/GLM-5.3',
    ms: 'https://modelscope.cn/models/ZhipuAI/GLM-5.3',
  },
}
