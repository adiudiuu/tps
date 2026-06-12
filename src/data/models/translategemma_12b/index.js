// TranslateGemma 12B: text-only 翻译专用模型，基于 Gemma 3 12B 同构
// 48 layers: 8 global + 40 local
// 2026-01-15 发布
// Source: https://huggingface.co/google/translategemma-12b-it
export default {
  id: 'translategemma_12b',
  released: '2026-01',
  name: 'TranslateGemma 12B',
  type: 'dense',
  params: 12.0,
  layers: 48,
  kv_heads: 8,
  head_dim: 256,
  local_layers: 40,
  sliding_window: 1024,
  hidden_size: 3840,
  max_ctx: 131072,
  tags: ['translation'],
  links: {
    ollama: null,
    hf: 'https://huggingface.co/google/translategemma-12b-it',
    ms: null,
  },
}
