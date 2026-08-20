// Hy3: 295B MoE / 21B active, 192 routed experts top-8 + 1 shared, GQA, 256K ctx
// Official GA release from Tencent Hy Team, Apache 2.0
// Source: https://huggingface.co/tencent/Hy3/blob/main/config.json
export default {
  id: 'hy3',
  name: 'Hy3 (295B-A21B)',
  type: 'moe',
  params: 295,
  active_params: 21,
  experts: 192,
  experts_per_token: 8,
  moe_execution: 'shared_routed',
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 262144,
  tags: ['chat', 'multilingual', 'reasoning', 'coding'],
  released: '2026-07',
  links: {
    hf: 'https://huggingface.co/tencent/Hy3',
    ms: 'https://modelscope.cn/models/Tencent-Hunyuan/Hy3',
  },
}
