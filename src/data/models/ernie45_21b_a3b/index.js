// ERNIE-4.5-21B-A3B: 21B MoE / 3B active, 64 routed top-6 + 2 shared, 28 layers, 128K ctx
// Source: https://huggingface.co/baidu/ERNIE-4.5-21B-A3B-PT/blob/main/config.json
export default {
  id: 'ernie45_21b_a3b',
  name: 'ERNIE-4.5 21B-A3B',
  type: 'moe',
  params: 21,
  active_params: 3,
  experts: 64,
  experts_per_token: 6,
  moe_execution: 'shared_routed',
  layers: 28,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 2560,
  max_ctx: 131072,
  tags: ['chat', 'multilingual', 'reasoning'],
  released: '2025-06',
  links: {
    hf: 'https://huggingface.co/baidu/ERNIE-4.5-21B-A3B-PT',
    ms: 'https://modelscope.cn/models/PaddlePaddle/ERNIE-4.5-21B-A3B-PT',
  },
}
