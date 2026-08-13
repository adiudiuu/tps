// Qwen3.8-2.4T-A95B (open-weight Qwen3.8-Max): 2.4T MoE / 95B active
// 92 layers (69 GatedDeltaNet linear + 23 full attention, full_attention_interval=4)
// 512 routed experts / 10 active + 1 shared, hidden=8192, GQA 64Q/4KV head_dim=256
// Native ctx 262,144; README: extensible up to 1,010,000 (hosted Qwen3.8-Max is 1M + vision, not this checkpoint)
// Open weights: 2026-08-12 (HF + ModelScope); architecture = Qwen3_5MoeForCausalLM
// Source: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B/blob/main/config.json
export default {
  id: 'qwen38_max',
  name: 'Qwen3.8-Max (2.4T-A95B)',
  type: 'moe',
  params: 2400,
  active_params: 95,
  experts: 512,
  experts_per_token: 10,
  moe_execution: 'shared_routed',
  layers: 92,
  linear_attention_layers: 69, // GatedDeltaNet，不支持 Flash Attention（full_attention_interval=4）
  local_layers: 69,
  sliding_window: 0, // 线性层不占用标准 KV cache；calc.js 用 local_layers+window=0 只计 23 层 full-attn KV
  kv_heads: 4,
  head_dim: 256,
  hidden_size: 8192,
  max_ctx: 262144,
  tags: ['chat', 'multilingual', 'coding', 'reasoning'],
  released: '2026-08',
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3.8-2.4T-A95B',
  },
}
