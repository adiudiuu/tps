// Gemma 4 12B Unified (Google DeepMind, 2026-06-04)
// Apache 2.0, "encoder-free" 多模态 (text/image/audio/video 直接投影进 decoder)
// 真实 config.json: https://huggingface.co/google/gemma-4-12b-it/raw/main/config.json
// - 48 layers, hidden 3840, intermediate 15360
// - 16Q / 8KV GQA, head_dim 256 (sliding) / 512 (full)
// - 5:1 sliding:full layer pattern (40 sliding + 8 full)
// - max_position_embeddings 262144 (256K)
// - vision mm_embed_dim 3840 (= hidden), patch_size 16, model_patch_size 48
// - audio_embed_dim 640 -> proj to 3840
// - vocab 262144, tied embeddings
export default {
  id: 'gemma4_12b_unified',
  released: '2026-06',
  name: 'Gemma 4 12B Unified',
  type: 'dense',
  params: 12,
  layers: 48,
  kv_heads: 8,
  head_dim: 256,           // sliding attention head_dim
  hidden_size: 3840,
  max_ctx: 262144,         // 256K
  tags: ['multimodal', 'encoder-free', 'sliding+global'],
  links: {
    ollama: 'ollama pull gemma4:12b',
    hf: 'https://huggingface.co/google/gemma-4-12b-it',
    ms: 'https://modelscope.cn/models/google/gemma-4-12b-it',
  },
}
