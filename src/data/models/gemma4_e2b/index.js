// Gemma 4 E2B: interleaved local(sliding window) + global attention
// 4:1 ratio — 28 sliding layers (window=512) + 7 global layers
// local: kv_heads=1, head_dim=256 / global: kv_heads=1, head_dim=512
// Source: https://huggingface.co/google/gemma-4-e2b-it/blob/main/config.json
export default {
  id: 'gemma4_e2b',
  released: '2026-04',
  name: 'Gemma 4 E2B (5.1B)',
  type: 'dense',
  params: 5.1,
  layers: 35,
  kv_heads: 1,           // local (sliding) attention KV heads
  head_dim: 256,
  global_head_dim: 512,  // global attention head dim (global_kv_heads same as local = 1)
  local_layers: 28,      // sliding window layer count
  sliding_window: 512,   // local attention window size (tokens)
  hidden_size: 1536,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull gemma4:e2b',
    hf: 'https://huggingface.co/google/gemma-4-e2b-it',
    ms: 'https://modelscope.cn/models/LLM-Research/gemma-4-e2b-it',
  },
}
