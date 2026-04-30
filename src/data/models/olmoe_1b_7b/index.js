// OLMoE 1B-7B: MoE, 7B total / 1B active, fully open by Allen AI
// Source: https://huggingface.co/allenai/OLMoE-1B-7B-0924
export default {
  id: 'olmoe_1b_7b',
  released: '2024-09',
  name: 'OLMoE 1B-7B',
  type: 'moe',
  params: 7,
  active_params: 1,
  experts: 64,
  experts_per_token: 8,
  layers: 16,
  kv_heads: 16,
  head_dim: 128,
  hidden_size: 2048,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/allenai/OLMoE-1B-7B-0924',
  },
}
