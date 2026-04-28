// Gemma 2 27B: alternating local(sliding window=4096) + global attention
// 46 layers: 23 local + 23 global, same kv_heads for both
// Source: https://huggingface.co/google/gemma-2-27b
export default {
  id: 'gemma2_27b',
  released: '2024-06',
  name: 'Gemma2 27B',
  type: 'dense',
  params: 27,
  layers: 46,
  kv_heads: 16,
  head_dim: 128,
  local_layers: 23,      // sliding window layer count
  sliding_window: 4096,  // local attention window size (tokens)
  hidden_size: 4608,
  max_ctx: 8192,
  links: {
    ollama: 'ollama pull gemma2:27b',
    hf: 'https://huggingface.co/google/gemma-2-27b',
    ms: 'https://modelscope.cn/models/LLM-Research/gemma-2-27b',
  },
}
