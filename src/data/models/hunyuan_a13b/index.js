// Hunyuan-A13B: 80B MoE / 13B active, 64 routed experts top-8 + 1 shared, GQA, 256K ctx
// config.json max_position_embeddings=32768 is a default OOM guard; README: native 256K
// Source: https://huggingface.co/tencent/Hunyuan-A13B-Instruct-FP8/blob/main/config.json
export default {
  id: 'hunyuan_a13b',
  name: 'Hunyuan-A13B (80B-A13B)',
  type: 'moe',
  params: 80,
  active_params: 13,
  experts: 64,
  experts_per_token: 8,
  moe_execution: 'shared_routed',
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 262144,
  tags: ['chat', 'multilingual', 'reasoning', 'coding'],
  released: '2025-06',
  links: {
    hf: 'https://huggingface.co/tencent/Hunyuan-A13B-Instruct',
    ms: 'https://modelscope.cn/models/Tencent-Hunyuan/Hunyuan-A13B-Instruct',
  },
}
