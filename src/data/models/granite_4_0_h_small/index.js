// Granite 4.0-H-Small: 32B / 9B active hybrid Mamba-Attention MoE
// Source: https://huggingface.co/ibm-granite/granite-4.0-h-small/blob/main/config.json
export default {
  id: 'granite_4_0_h_small',
  name: 'Granite 4.0-H-Small',
  type: 'moe',
  params: 32,
  active_params: 9,
  experts: 72,
  experts_per_token: 10,
  moe_execution: 'shared_routed',
  layers: 40,
  mamba_ratio: 4 / 40,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  tags: ['chat', 'hybrid'],
  released: '2025-09',
  links: {
    hf: 'https://huggingface.co/ibm-granite/granite-4.0-h-small',
  },
}
