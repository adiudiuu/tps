// Kimi K3: 2.8T MoE / 104B active, KDA + Gated MLA hybrid attention, 1M context
// Released: 2026-07-16 (API), open weights 2026-07-27
// Architecture: 93 layers (69 Kimi Delta Attention + 24 Gated MLA),
//   896 routed experts top-16 + 2 shared experts, hidden=7168, 96 attn heads
// Native MXFP4 weights / MXFP8 activations; MoonViT-V2 vision encoder (401M)
// Source: https://huggingface.co/moonshotai/Kimi-K3
export default {
  id: 'kimi_k3',
  name: 'Kimi K3 (MoE)',
  type: 'moe',
  params: 2800,
  active_params: 104,
  experts: 896,
  experts_per_token: 16,
  moe_execution: 'shared_routed',
  layers: 93,
  // 69 KDA linear-attention layers: no standard KV cache (recurrent state)
  local_layers: 69,
  sliding_window: 0, // 同 Qwen3.6：window=0 → 线性层 KV 贡献归零
  linear_attention_layers: 69,
  // 24 Gated MLA layers：压缩 KV（与 Kimi K2 / DeepSeek HCA 同形）
  kv_heads: 1,
  head_dim: 512,
  hidden_size: 7168,
  max_ctx: 1048576,
  vision_encoder_params: 0.401,
  tags: ['chat', 'multilingual', 'vision', 'multimodal'],
  released: '2026-07',
  links: {
    hf: 'https://huggingface.co/moonshotai/Kimi-K3',
    ms: 'https://modelscope.cn/models/moonshotai/Kimi-K3',
  },
}
