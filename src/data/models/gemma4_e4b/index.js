// Gemma 4 E4B: interleaved local(sliding window) + global attention
// 5:1 ratio — 35 sliding layers (window=512) + 7 global layers
// local: kv_heads=2, head_dim=256 / global: kv_heads=2, head_dim=512
// Source: https://huggingface.co/google/gemma-4-e4b-it/blob/main/config.json
export default {
  id: 'gemma4_e4b',
  released: '2026-04',
  name: 'Gemma 4 E4B (8B)',
  type: 'dense',
  params: 8,
  layers: 42,
  kv_heads: 2,           // local (sliding) attention KV heads
  head_dim: 256,
  global_head_dim: 512,  // global attention head dim (global_kv_heads same as local = 2)
  local_layers: 35,      // sliding window layer count
  sliding_window: 512,   // local attention window size (tokens)
  hidden_size: 2560,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull gemma4:e4b',
    hf: 'https://huggingface.co/google/gemma-4-e4b-it',
    ms: 'https://modelscope.cn/models/LLM-Research/gemma-4-e4b-it',
  },
}
