// Qwen3.5-35B-A3B: MoE, 40 layers (30 GatedDeltaNet linear + 10 full attention), 256 experts / 8 active, hybrid attention, 256K ctx
// Source: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/config.json
export default {
  id: 'qwen35_35b_a3b',
  released: '2026-02',
  name: 'Qwen3.5 35B-A3B',
  type: 'moe',
  params: 35,
  active_params: 3,
  experts: 256,
  experts_per_token: 8,
  layers: 40,
  linear_attention_layers: 30,  // GatedDeltaNet，不支持 Flash Attention
  kv_heads: 2,
  head_dim: 256,
  hidden_size: 2048,
  max_ctx: 262144,
  links: {
    ollama: 'ollama pull qwen3.5:35b-a3b',
    hf: 'https://huggingface.co/Qwen/Qwen3.5-35B-A3B',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3.5-35B-A3B',
  },
}
