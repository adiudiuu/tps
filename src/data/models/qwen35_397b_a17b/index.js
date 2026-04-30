// Qwen3.5-397B-A17B: MoE, 60 layers (45 GatedDeltaNet linear + 15 full attention), 512 experts / 10 active, hybrid attention, 256K ctx
// Source: https://huggingface.co/Qwen/Qwen3.5-397B-A17B/blob/main/config.json
export default {
  id: 'qwen35_397b_a17b',
  released: '2026-02',
  name: 'Qwen3.5 397B-A17B',
  type: 'moe',
  params: 397,
  active_params: 17,
  experts: 512,
  experts_per_token: 10,
  layers: 60,
  linear_attention_layers: 45,  // GatedDeltaNet，不支持 Flash Attention（full_attention_interval=4）
  kv_heads: 2,
  head_dim: 256,
  hidden_size: 4096,
  max_ctx: 262144,
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen3.5-397B-A17B',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3.5-397B-A17B',
  },
}
