// Step-3.5-Flash: ~196B MoE / ~11B active, 288 routed experts top-8 + 1 shared (share_expert_dim=1280), 256K ctx
// Full-attn 64Q/8KV；sliding 96Q/8KV（config attention_other_setting），窗口 512；MoE 层 3..44
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
  query_heads: 64,       // num_attention_heads（全注意力层）；sliding 层 96Q
  kv_heads: 8,           // num_attention_groups，两种层型均为 8
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
