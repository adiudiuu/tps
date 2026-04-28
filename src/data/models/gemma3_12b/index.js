// Gemma 3 12B: hybrid local(sliding=1024) + global attention, pattern=6
// 48 layers: 8 global + 40 local
// Source: https://huggingface.co/google/gemma-3-12b-it/blob/main/config.json
export default {
  id: 'gemma3_12b',
  released: '2025-03',
  name: 'Gemma 3 12B',
  type: 'dense',
  params: 12.0,
  layers: 48,
  kv_heads: 8,
  head_dim: 256,
  local_layers: 40,
  sliding_window: 1024,
  hidden_size: 3840,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull gemma3:12b',
    hf: 'https://huggingface.co/google/gemma-3-12b-it',
    ms: 'https://modelscope.cn/models/LLM-Research/gemma-3-12b-it',
  },
}
