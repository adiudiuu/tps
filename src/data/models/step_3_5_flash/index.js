// Step-3.5-Flash: ~196B MoE / ~11B active, 288 routed experts top-8, 256K context
// Source: https://huggingface.co/stepfun-ai/Step-3.5-Flash/blob/main/config.json
export default {
  id: 'step_3_5_flash',
  name: 'Step-3.5-Flash',
  type: 'moe',
  params: 196,
  active_params: 11,
  experts: 288,
  experts_per_token: 8,
  moe_execution: 'shared_routed',
  layers: 45,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  local_layers: 33,
  sliding_window: 512,
  max_ctx: 262144,
  tags: ['chat', 'reasoning', 'multilingual'],
  released: '2026-02',
  links: {
    hf: 'https://huggingface.co/stepfun-ai/Step-3.5-Flash',
  },
}
