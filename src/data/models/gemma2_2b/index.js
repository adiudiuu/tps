// Gemma 2 2B: alternating local(sliding window=4096) + global attention
// 26 layers: 13 local + 13 global
// Source: https://huggingface.co/google/gemma-2-2b/blob/main/config.json
export default {
  id: 'gemma2_2b',
  released: '2024-06',
  name: 'Gemma2 2B',
  type: 'dense',
  params: 2.6,
  layers: 26,
  kv_heads: 4,
  head_dim: 256,
  local_layers: 13,
  sliding_window: 4096,
  hidden_size: 2304,
  max_ctx: 8192,
  links: {
    ollama: 'ollama pull gemma2:2b',
    hf: 'https://huggingface.co/google/gemma-2-2b-it',
    ms: 'https://modelscope.cn/models/LLM-Research/gemma-2-2b-it',
  },
}
