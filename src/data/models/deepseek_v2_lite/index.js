// DeepSeek V2 Lite: MoE with MLA, 16B total / 2.4B active, 27 layers, 32K ctx
// Source: https://huggingface.co/deepseek-ai/DeepSeek-V2-Lite/blob/main/config.json
export default {
  id: 'deepseek_v2_lite',
  released: '2024-05',
  name: 'DeepSeek V2 Lite',
  type: 'moe',
  params: 15.7,
  active_params: 2.4,
  experts: 64,
  experts_per_token: 6,
  moe_execution: 'shared_routed',
  // MLA latent = kv_lora_rank(512) + qk_rope_head_dim(64) = 576
  // 官方 num_key_value_heads=16、qk_nope_head_dim=128 → 基线 2 × 16 × 128 = 4096
  mla_ratio: 0.140625,
  layers: 27,
  query_heads: 16, // num_attention_heads；HF deepseek-ai/DeepSeek-V2-Lite
  kv_heads: 16,
  head_dim: 128,
  hidden_size: 2048,
  max_ctx: 32768,
  tags: ['chat', 'multilingual'],
  links: {
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-V2-Lite',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-V2-Lite',
    ollama: 'https://ollama.com/library/deepseek-v2',
  },
}
