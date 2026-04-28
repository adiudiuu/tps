// Gemma 3 4B: hybrid local(sliding=1024) + global attention, pattern=6
// 34 layers: 5 global + 29 local
// Source: https://huggingface.co/google/gemma-3-4b-it/blob/main/config.json
export default {
  id: 'gemma3_4b',
  released: '2025-03',
  name: 'Gemma 3 4B',
  type: 'dense',
  params: 4.3,
  layers: 34,
  kv_heads: 4,
  head_dim: 256,
  local_layers: 29,
  sliding_window: 1024,
  hidden_size: 2560,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull gemma3:4b',
    hf: 'https://huggingface.co/google/gemma-3-4b-it',
    ms: 'https://modelscope.cn/models/LLM-Research/gemma-3-4b-it',
  },
}
