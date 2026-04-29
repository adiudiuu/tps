// Jamba 1.5 Mini: Hybrid Transformer-Mamba MoE, 12B active, 256K context
// Source: https://huggingface.co/ai21labs/AI21-Jamba-Mini-1.5
export default {
  id: 'jamba_1_5_mini',
  released: '2024-08',
  name: 'Jamba 1.5 Mini',
  type: 'moe',
  params: 52,
  active_params: 12,
  experts: 16,
  experts_per_token: 2,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 256000,
  links: {
    ollama: null,
    hf: 'https://huggingface.co/ai21labs/AI21-Jamba-Mini-1.5',
    ms: null
  }
}
