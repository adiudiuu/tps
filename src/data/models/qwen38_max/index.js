// Qwen3.8-Max: 2.4T MoE / 95B active, hybrid attention (Qwen3.5 foundation), 1M context
// Released: 2026-08-03 (API GA); open weights announced for ~2026-08-10
// Published totals from Alibaba; layer/expert geometry estimated from Qwen3.5 MoE
// (397B-A17B: 60L / 512E top-10 / GatedDeltaNet hybrid) pending config.json
// Source: https://qwen.ai/blog?id=qwen3.8
export default {
  id: 'qwen38_max',
  name: 'Qwen3.8-Max (MoE)',
  type: 'moe',
  params: 2400,
  active_params: 95,
  experts: 512,
  experts_per_token: 10,
  layers: 80,
  linear_attention_layers: 60, // 估算：沿用 Qwen3.5 ~75% 线性注意力占比
  kv_heads: 4,
  head_dim: 256,
  hidden_size: 8192,
  max_ctx: 1048576,
  tags: ['chat', 'multilingual', 'vision', 'multimodal'],
  released: '2026-08',
  status: 'preview', // 权重未完全公开，结构参数为估算，开源后需对齐 config.json
  links: {
    hf: 'https://huggingface.co/Qwen',
    ms: 'https://modelscope.cn/models/Qwen',
  },
}
