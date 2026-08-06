export default {
  id: 'deepseek_v2',
  released: '2024-05',
  name: 'DeepSeek V2',
  type: 'moe',
  params: 236,
  active_params: 21,
  experts: 160,
  experts_per_token: 6,
  moe_execution: 'shared_routed',
  // MLA latent = kv_lora_rank(512) + qk_rope_head_dim(64) = 576，基线 2 × 128 × 128 = 32768
  mla_ratio: 0.0176,
  layers: 60,
  kv_heads: 128,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 131072,
  tags: ['chat', 'multilingual'],
  links: {
    ollama: 'ollama pull deepseek-v2',
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-V2',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-V2',
  },
}
