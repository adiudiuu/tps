// Gemma 2 9B: alternating local(sliding window=4096) + global attention
// 42 layers: 21 local + 21 global, same kv_heads for both
// Source: https://huggingface.co/google/gemma-2-9b
export default {
  id: 'gemma2_9b',
  released: '2024-06',
  name: 'Gemma2 9B',
  type: 'dense',
  params: 9,
  layers: 42,
  kv_heads: 8,
  head_dim: 256,
  local_layers: 21,      // sliding window layer count
  sliding_window: 4096,  // local attention window size (tokens)
  hidden_size: 3584,
  max_ctx: 8192,
  links: {
    ollama: 'ollama pull gemma2:9b',
    hf: 'https://huggingface.co/google/gemma-2-9b',
    ms: 'https://modelscope.cn/models/LLM-Research/gemma-2-9b',
  },
}
