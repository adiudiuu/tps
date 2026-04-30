// DeepSeek-V4-Flash: 284B MoE, 13B active, CSA+HCA hybrid attention, 1M context
// Released: April 24, 2026
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
  mla_ratio: null,
  layers: 43,
  kv_heads: 1,
  head_dim: 512,
  hidden_size: 4096,
  max_ctx: 1048576,
  released: '2026-04',
  links: {
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Flash',
  },
}
