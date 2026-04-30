// Qwen3.5-122B-A10B: MoE, 48 layers (36 GatedDeltaNet linear + 12 full attention), 256 experts / 8 active, hybrid attention, 256K ctx
// Source: https://huggingface.co/Qwen/Qwen3.5-122B-A10B/blob/main/config.json
export default {
  id: 'qwen35_122b_a10b',
  released: '2026-02',
  name: 'Qwen3.5 122B-A10B',
  type: 'moe',
  params: 122,
  active_params: 10,
  experts: 256,
  experts_per_token: 8,
  layers: 48,
  linear_attention_layers: 36,  // GatedDeltaNet，不支持 Flash Attention（full_attention_interval=4）
  kv_heads: 2,
  head_dim: 256,
  hidden_size: 3072,
  max_ctx: 262144,
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen3.5-122B-A10B',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3.5-122B-A10B',
  },
}
