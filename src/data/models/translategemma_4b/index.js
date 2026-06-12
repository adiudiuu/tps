// TranslateGemma 4B: text-only 翻译专用模型，基于 Gemma 3 4B 同构
// 34 layers: 5 global + 29 local
// 2026-01-15 发布（与 12B/27B 同时）
// Source: https://huggingface.co/google/translategemma-4b-it
export default {
  id: 'translategemma_4b',
  released: '2026-01',
  name: 'TranslateGemma 4B',
  type: 'dense',
  params: 4.3,
  layers: 34,
  kv_heads: 4,
  head_dim: 256,
  local_layers: 29,
  sliding_window: 1024,
  hidden_size: 2560,
  max_ctx: 131072,
  tags: ['translation'],
  links: {
    ollama: null,
    hf: 'https://huggingface.co/google/translategemma-4b-it',
    ms: null,
  },
}
