// Gemma 3 27B: hybrid local(sliding=1024) + global attention, pattern=6
// 62 layers: 10 global + 52 local; global uses kv_heads=16, head_dim=128
// Source: https://huggingface.co/google/gemma-3-27b-it/blob/main/config.json
export default {
  id: 'gemma3_27b',
  released: '2025-03',
  name: 'Gemma 3 27B',
  type: 'dense',
  params: 27.0,
  layers: 62,
  kv_heads: 16,
  head_dim: 128,
  local_layers: 52,
  sliding_window: 1024,
  hidden_size: 5376,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull gemma3:27b',
    hf: 'https://huggingface.co/google/gemma-3-27b-it',
    ms: 'https://modelscope.cn/models/LLM-Research/gemma-3-27b-it',
  },
}
