// Qwen1.5-MoE-A2.7B: MoE 14.3B total / 2.7B active, 24 layers, 32K ctx
// 60 experts per layer, 4 active; GQA (16 heads / 8 KV heads)
// Source: https://huggingface.co/Qwen/Qwen1.5-MoE-A2.7B/blob/main/config.json
export default {
  id: 'qwen1_5_moe_a2_7b',
  released: '2024-03',
  name: 'Qwen1.5-MoE-A2.7B',
  type: 'moe',
  params: 14.3,
  active_params: 2.7,
  experts: 60,
  experts_per_token: 4,
  mla_ratio: null,
  layers: 24,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 2048,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen1.5-MoE-A2.7B-Chat',
    ms: 'https://modelscope.cn/models/Qwen/Qwen1.5-MoE-A2.7B-Chat',
    ollama: 'https://ollama.com/library/qwen1.5:moe',
  },
}
