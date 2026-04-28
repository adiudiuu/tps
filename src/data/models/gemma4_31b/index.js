// Gemma 4 31B: interleaved local(sliding window) + global attention
// 5:1 ratio — 50 sliding layers (window=1024) + 10 global layers
// local:  kv_heads=16, head_dim=256
// global: kv_heads=4,  head_dim=512
// Source: https://huggingface.co/google/gemma-4-31b-it/blob/main/config.json
export default {
  id: 'gemma4_31b',
  released: '2026-04',
  name: 'Gemma 4 31B',
  type: 'dense',
  params: 30.7,
  layers: 60,
  kv_heads: 16,          // local (sliding) attention KV heads
  head_dim: 256,
  global_kv_heads: 4,    // global (full) attention KV heads
  global_head_dim: 512,  // global attention head dim
  local_layers: 50,      // sliding window layer count
  sliding_window: 1024,  // local attention window size (tokens)
  hidden_size: 5376,
  max_ctx: 262144,
  links: {
    ollama: 'ollama pull gemma4:31b',
    hf: 'https://huggingface.co/google/gemma-4-31b-it',
    ms: 'https://modelscope.cn/models/LLM-Research/gemma-4-31b-it',
  },
}
