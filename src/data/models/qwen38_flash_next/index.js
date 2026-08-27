// Qwen3.8-Flash-Next: 125B-A6B MoE + 51B n-gram + 4B MTP ≈ 180B VRAM 口径; GDN + QSA hybrid, VLM, 262K ctx
// 48 layers (36 GatedDeltaNet linear + 12 Qwen Sparse Attention, full_attention_interval=4)
// 512 routed experts top-10 + 1 shared; hidden=2560, GQA 24Q/2KV head_dim=256
// Open weights: 2026-08 (HF + ModelScope, Qwen Community License)
// Source: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/config.json
export default {
  id: 'qwen38_flash_next',
  name: 'Qwen3.8-Flash-Next (125B-A6B)',
  type: 'moe',
  params: 180,  // 125B MoE + 51B n-gram + 4B MTP（README VRAM 口径）
  active_params: 6,
  experts: 512,
  experts_per_token: 10,
  moe_execution: 'shared_routed',
  layers: 48,
  linear_attention_layers: 36, // GatedDeltaNet
  local_layers: 36,
  sliding_window: 0,
  kv_heads: 2,
  head_dim: 256,
  hidden_size: 2560,
  max_ctx: 262144,
  // ViT: depth=27, hidden=1152（同 Qwen3.8-27B 架构）
  vision_encoder_params: 0.8,
  vision_seq_tokens: 1280,
  tags: ['chat', 'multilingual', 'coding', 'reasoning', 'vision', 'multimodal'],
  released: '2026-08',
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen3.8-Flash-Next',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3.8-Flash-Next',
  },
}
