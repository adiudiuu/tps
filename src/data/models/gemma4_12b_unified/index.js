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
  // 5:1 sliding:full — 40 sliding (window=1024) + 8 global
  // local:  kv_heads=8, head_dim=256
  // global: kv_heads=1, head_dim=512（config: num_global_key_value_heads / global_head_dim）
  kv_heads: 8,             // local (sliding) attention KV heads
  head_dim: 256,           // sliding attention head_dim
  global_kv_heads: 1,      // global (full) attention KV heads
  global_head_dim: 512,    // global attention head dim
  local_layers: 40,        // sliding window layer count
  sliding_window: 1024,    // local attention window size (tokens)
  hidden_size: 3840,
  max_ctx: 262144,         // 256K
  tags: ['multimodal', 'encoder-free', 'sliding+global'],
  // encoder-free：config.json vision_config.num_soft_tokens=280（官方默认 soft-token budget）
  // 可选预算：70 / 140 / 280 / 560 / 1120（Gemma 4 model card / transformers docs）
  vision_seq_tokens: 280,
  links: {
    ollama: 'ollama pull gemma4:12b',
    hf: 'https://huggingface.co/google/gemma-4-12b-it',
    ms: 'https://modelscope.cn/models/google/gemma-4-12b-it',
  },
}
