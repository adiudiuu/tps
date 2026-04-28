// Gemma 3 1B: hybrid local(sliding=512) + global attention, pattern=6 (every 6th layer is global)
// 26 layers: 4 global + 22 local
// Source: https://huggingface.co/google/gemma-3-1b-it/blob/main/config.json
export default {
  id: 'gemma3_1b',
  released: '2025-03',
  name: 'Gemma 3 1B',
  type: 'dense',
  params: 1.0,
  layers: 26,
  kv_heads: 1,
  head_dim: 256,
  local_layers: 22,
  sliding_window: 512,
  hidden_size: 1152,
  max_ctx: 32768,
  links: {
    ollama: 'ollama pull gemma3:1b',
    hf: 'https://huggingface.co/google/gemma-3-1b-it',
    ms: 'https://modelscope.cn/models/LLM-Research/gemma-3-1b-it',
  },
}
