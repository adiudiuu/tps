// ERNIE-4.5-300B-A47B: 300B MoE / 47B active, 64 routed top-8, no shared experts, 54 layers, 128K ctx
// Official card: Text Experts 64 / 8; config moe_num_shared_experts=0
// Source: https://huggingface.co/baidu/ERNIE-4.5-300B-A47B-PT/blob/main/config.json
export default {
  id: 'ernie45_300b_a47b',
  name: 'ERNIE-4.5 300B-A47B',
  type: 'moe',
  params: 300,
  active_params: 47,
  experts: 64,
  experts_per_token: 8,
  layers: 54,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 131072,
  tags: ['chat', 'multilingual'],
  released: '2025-06',
  links: {
    hf: 'https://huggingface.co/baidu/ERNIE-4.5-300B-A47B-PT',
    ms: 'https://modelscope.cn/models/PaddlePaddle/ERNIE-4.5-300B-A47B-PT',
  },
}
