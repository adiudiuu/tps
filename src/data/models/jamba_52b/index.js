// Jamba 52B: Hybrid Transformer-Mamba MoE, 12B active
// Source: https://huggingface.co/ai21labs/Jamba-v0.1
// 架构：每 4 层 1 个 Transformer（有 KV Cache）+ 3 个 Mamba（无 KV Cache）
// 实际 KV Cache 层数 = 32 × 1/4 = 8 层，用 mamba_ratio 修正
export default {
  id: 'jamba_52b',
  released: '2024-03',
  name: 'Jamba 52B',
  type: 'moe',
  params: 52,
  active_params: 12,
  experts: 16,
  experts_per_token: 2,
  layers: 32,
  mamba_ratio: 0.25,  // 只有 1/4 层是 Transformer（有 KV Cache），其余为 Mamba 层
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 256000,
  links: {
    ollama: null,
    hf: 'https://huggingface.co/ai21labs/Jamba-v0.1',
    ms: null
  }
}
