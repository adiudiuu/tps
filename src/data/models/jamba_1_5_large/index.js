// Jamba 1.5 Large: Hybrid Transformer-Mamba MoE, 94B active, 256K context
// Source: https://huggingface.co/ai21labs/AI21-Jamba-Large-1.5
// 架构：每 4 层 1 个 Transformer（有 KV Cache）+ 3 个 Mamba（无 KV Cache）
// 实际 KV Cache 层数 = 64 × 1/4 = 16 层，用 mamba_ratio 修正
export default {
  id: 'jamba_1_5_large',
  released: '2024-08',
  name: 'Jamba 1.5 Large',
  type: 'moe',
  params: 398,
  active_params: 94,
  experts: 16,
  experts_per_token: 2,
  layers: 64,
  mamba_ratio: 0.25,  // 只有 1/4 层是 Transformer（有 KV Cache），其余为 Mamba 层
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 256000,
  links: {
    ollama: null,
    hf: 'https://huggingface.co/ai21labs/AI21-Jamba-Large-1.5',
    ms: null
  }
}
