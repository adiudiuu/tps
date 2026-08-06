export default {
  id: 'deepseek_v3',
  released: '2024-12',
  name: 'DeepSeek V3',
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
    ollama: 'ollama pull deepseek-v3',
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-V3',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-V3',
  },
}
