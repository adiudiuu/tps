// Qwen3.8-27B: dense VLM, 64 layers, hybrid Gated DeltaNet + full attention
// full_attention_interval=4: 48 linear layers (no KV cache) + 16 full attention
// Official: 27B language + ViT (HF/ModelScope checkpoint ≈ 27.78B / 28B)
// Native ctx 262,144; extensible to 1,000,000. Open weights: 2026-08-14
// Source: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/config.json
export default {
  id: 'qwen38_27b',
  name: 'Qwen3.8-27B',
  type: 'dense',
  params: 27,
  layers: 64,
  kv_heads: 4,
  head_dim: 256,
  linear_attention_layers: 48, // GatedDeltaNet，不支持 Flash Attention
  local_layers: 48,
  sliding_window: 0,     // 线性注意力层不产生标准 KV cache
  hidden_size: 5120,
  max_ctx: 262144,
  // ViT: depth=27, hidden=1152, intermediate=4304, patch=16, spatial_merge=2
  // Official language=27B; ModelScope/HF total ≈ 27.78–28B
  vision_encoder_params: 0.8,
  vision_seq_tokens: 1280,
  tags: ['chat', 'multilingual', 'coding', 'vision', 'multimodal'],
  released: '2026-08',
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen3.8-27B',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3.8-27B',
  },
}
