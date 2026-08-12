// DeepSeek-V4-Flash: 284B MoE, 13B active, CSA+HCA hybrid attention, 1M context
// Preview: 2026-04-24; Official GA build DeepSeek-V4-Flash-0731: 2026-07-31
// Official changelog: 0731 keeps the same architecture/size as Preview — only re-post-trained
// Source: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
// Config: num_hidden_layers=43, hidden_size=4096, num_attention_heads=64,
//         num_key_value_heads=1 (HCA), head_dim=512 (latent KV dim),
//         n_routed_experts=256, num_experts_per_tok=6, n_shared_experts=1
export default {
  id: 'deepseek_v4_flash',
  name: 'DeepSeek V4 Flash',
  type: 'moe',
  params: 284,
  active_params: 13,
  experts: 256,
  experts_per_token: 6,
  moe_execution: 'shared_routed',
  // head_dim=512 即 latent KV 维度，实际缓存 512 + qk_rope_head_dim(64) = 576，基线为 2 × 1 × 512
  mla_ratio: 0.5625,  // 576 / 1024
  layers: 43,
  kv_heads: 1,
  head_dim: 512,
  hidden_size: 4096,
  max_ctx: 1048576,
  tags: ['chat', 'multilingual', 'coding', 'reasoning'],
  released: '2026-04',
  links: {
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Flash',
  },
}
