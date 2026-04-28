// Qwen3.6 35B A3B: MoE, 35B total / 3B active, hybrid Gated DeltaNet(linear) + standard attention
// full_attention_interval=4: 30 linear layers (no KV cache) + 10 full attention layers
// Source: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/config.json
export default {
  id: 'qwen3_6_35b_a3b',
  name: 'Qwen3.6 35B A3B (MoE)',
  type: 'moe',
  params: 35,
  active_params: 3,
  layers: 40,
  kv_heads: 2,           // full attention KV heads
  head_dim: 256,
  local_layers: 30,      // linear attention layers (no standard KV cache)
  sliding_window: 0,     // linear attention 不占用 KV cache
  hidden_size: 2048,
  max_ctx: 262144,
  released: '2026-04',
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen3.6-35B-A3B',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3.6-35B-A3B',
  },
}
