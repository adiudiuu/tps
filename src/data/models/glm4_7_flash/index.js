// GLM-4.7-Flash: 30B MoE with 3B active
// Source: https://huggingface.co/zai-org/GLM-4.7-Flash/blob/main/config.json
// config: hidden=2048, layers=47, 20Q/20KV, 64 routed experts top-4 + 1 shared
// MLA: kv_lora_rank=512, qk_rope_head_dim=64, qk_nope_head_dim=192
export default {
  id: 'glm4_7_flash',
  released: '2025-12',
  name: 'GLM-4.7-Flash',
  type: 'moe',
  params: 30,
  active_params: 3,
  experts: 64,
  experts_per_token: 4,
  moe_execution: 'shared_routed',
  mla_ratio: 0.075, // (512+64) / (2 × 20 × 192)
  layers: 47,
  query_heads: 20,
  kv_heads: 20,
  head_dim: 192,
  hidden_size: 2048,
  max_ctx: 131072,
  tags: ['chat', 'multilingual'],

  links: {
    ollama: null,
    hf: 'https://huggingface.co/zai-org/GLM-4.7-Flash',
    ms: 'https://modelscope.cn/models/ZhipuAI/glm-4.7-flash'
  }
}
