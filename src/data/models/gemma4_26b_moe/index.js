// Gemma 4 26B MoE: 8 active / 128 total experts + 1 shared
// 5:1 ratio — 25 sliding layers (window=1024) + 5 global layers
// local: kv_heads=8, head_dim=256 / global: kv_heads=2, head_dim=512
// Source: https://huggingface.co/unsloth/gemma-4-26B-A4B-it-GGUF/blob/main/config.json
export default {
  id: 'gemma4_26b_moe',
  released: '2026-04',
  name: 'Gemma 4 26B (MoE)',
  type: 'moe',
  params: 25.2,
  active_params: 3.8,
  experts: 128,
  experts_per_token: 8,
  mla_ratio: null,
  layers: 30,
  kv_heads: 8,           // local (sliding) attention KV heads
  head_dim: 256,
  global_kv_heads: 2,    // global (full) attention KV heads
  global_head_dim: 512,  // global attention head dim
  local_layers: 25,      // sliding window layer count
  sliding_window: 1024,  // local attention window size (tokens)
  hidden_size: 2816,
  max_ctx: 262144,
  links: {
    ollama: 'ollama pull gemma4:26b',
    hf: 'https://huggingface.co/google/gemma-4-26b-it',
    ms: 'https://modelscope.cn/models/LLM-Research/gemma-4-26b-it',
  },
}
