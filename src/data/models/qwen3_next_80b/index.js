// Qwen3-Next-80B-A3B: 80B MoE / 3B active, hybrid GatedDeltaNet + Gated Attention
// 48 layers, full_attention_interval=4 → 36 linear + 12 full; 512 experts / 10 routed + 1 shared
// Source: https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct/blob/main/config.json
export default {
  id: 'qwen3_next_80b',
  name: 'Qwen3-Next 80B-A3B',
  type: 'moe',
  params: 80,
  active_params: 3,
  experts: 512,
  experts_per_token: 10,
  moe_execution: 'shared_routed',
  layers: 48,
  linear_attention_layers: 36, // GatedDeltaNet，不支持 Flash Attention（full_attention_interval=4）
  local_layers: 36,
  sliding_window: 0, // 线性层不占用标准 KV cache
  kv_heads: 2,
  head_dim: 256,
  hidden_size: 2048,
  max_ctx: 262144,
  tags: ['chat', 'multilingual', 'reasoning'],
  released: '2025-09',
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3-Next-80B-A3B-Instruct',
  },
}
