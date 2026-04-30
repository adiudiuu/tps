// DeepSeek-V4-Pro: 1.6T MoE, 49B active, CSA+HCA hybrid attention, 1M context
// Released: April 24, 2026
// Source: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
// Config: num_hidden_layers=61, hidden_size=7168, num_attention_heads=128,
//         num_key_value_heads=1 (HCA), head_dim=512 (latent KV dim),
//         n_routed_experts=384, num_experts_per_tok=6, n_shared_experts=1
export default {
  id: 'deepseek_v4_pro',
  name: 'DeepSeek V4 Pro',
  type: 'moe',
  params: 1600,
  active_params: 49,
  experts: 384,
  experts_per_token: 6,
  mla_ratio: null,
  layers: 61,
  kv_heads: 1,
  head_dim: 512,
  hidden_size: 7168,
  max_ctx: 1048576,
  released: '2026-04',
  links: {
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Pro',
  },
}
