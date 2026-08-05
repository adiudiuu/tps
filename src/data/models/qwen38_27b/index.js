// Qwen3.8-27B: dense companion to Qwen3.8-Max, open weights announced with Max
// Released: 2026-08 (weights pending ~2026-08-10)
// Geometry provisional: mirror Qwen3.6-27B hybrid Gated DeltaNet + full attention
// Source: Alibaba Qwen3.8 announcement (weights not on HF yet)
export default {
  id: 'qwen38_27b',
  name: 'Qwen3.8 27B',
  type: 'dense',
  params: 27,
  layers: 64,
  kv_heads: 4,
  head_dim: 256,
  local_layers: 48,
  sliding_window: 0, // 线性注意力层不产生标准 KV cache
  hidden_size: 5120,
  max_ctx: 262144,
  tags: ['chat', 'multilingual'],
  released: '2026-08',
  status: 'preview',
  links: {
    hf: 'https://huggingface.co/Qwen',
    ms: 'https://modelscope.cn/models/Qwen',
  },
}
