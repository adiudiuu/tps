// Qwen3.6 27B: dense, 64 layers, hybrid Gated DeltaNet(linear) + standard attention
// full_attention_interval=4: 48 linear layers (no KV cache) + 16 full attention layers
// Source: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/config.json
export default {
  id: 'qwen3_6_27b',
  name: 'Qwen3.6 27B',
  type: 'dense',
  params: 27,
  layers: 64,
  kv_heads: 4,           // full attention KV heads
  head_dim: 256,
  local_layers: 48,      // linear attention layers (no standard KV cache)
  sliding_window: 0,     // 约定：window=0 表示这些层不产生 KV cache（GatedDeltaNet 线性 attention）
                         // calc.js 中 Math.min(ctx, 0) = 0，使这 48 层的 KV 贡献归零
                         // 这是一个有意为之的 hack，请勿改为 null（null 会走普通 KV 计算路径）
  hidden_size: 5120,
  max_ctx: 262144,
  released: '2026-04',
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen3.6-27B',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3.6-27B',
  },
}
