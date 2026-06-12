// TranslateGemma 27B: text-only 翻译专用模型，基于 Gemma 3 27B 同构
// 62 layers: 10 global + 52 local
// global 层使用 kv_heads=16, head_dim=128（与 Gemma 3 27B 一致）
// 2026-01-15 发布
// Source: https://huggingface.co/google/translategemma-27b-it
export default {
  id: 'translategemma_27b',
  released: '2026-01',
  name: 'TranslateGemma 27B',
  type: 'dense',
  params: 27.0,
  layers: 62,
  kv_heads: 16,          // local (sliding) attention KV heads
  head_dim: 128,
  local_layers: 52,
  sliding_window: 1024,
  hidden_size: 5376,
  max_ctx: 131072,
  tags: ['translation'],
  links: {
    ollama: null,
    hf: 'https://huggingface.co/google/translategemma-27b-it',
    ms: null,
  },
}
