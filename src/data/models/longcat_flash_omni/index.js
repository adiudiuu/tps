// LongCat-Flash-Omni: 560B ScMoE / 27B active, MLA attention, zero-computation experts, omni-modal (text/image/video/audio)
// Shortcut-connected MoE (dense FFN 并行 routed experts) + 256 zero-computation(identity) experts
// 560B 为 LLM 主干（同 LongCat-Flash）；视觉/音频编码器为额外模块，本计算器仅建模视觉（音频无对应路径）
// Open weights: 2026-09 (HF + ModelScope, MIT)
// Source: https://huggingface.co/meituan-longcat/LongCat-Flash-Omni/blob/main/config.json
// Config: num_layers=28, hidden_size=6144, num_attention_heads=64, attention_method=MLA,
//         kv_lora_rank=512, qk_rope_head_dim=64, n_routed_experts=512, moe_topk=12, zero_expert_num=256
// Vision (vision/config.json): num_hidden_layers=32, hidden_size=1280, intermediate=5184 (SwiGLU),
//         patch=14, spatial_merge=1, image_size=1792, max_tokens=5832/图 → 编码器约 0.85B
export default {
  id: 'longcat_flash_omni',
  name: 'LongCat-Flash-Omni (560B-A27B)',
  type: 'moe',
  params: 560,
  active_params: 27,
  experts: 512,
  experts_per_token: 12,
  moe_execution: 'parallel_dense_routed', // ScMoE：dense FFN(12288) 与 routed experts 并行
  // MLA：每 token 每层缓存 kv_lora_rank(512) + qk_rope_head_dim(64) = 576，基线按 2 × 1 × 512 = 1024
  mla_ratio: 0.5625,  // 576 / 1024
  layers: 28,
  query_heads: 64,       // num_attention_heads；hidden/head_dim 推不出（6144/512=12）
  kv_heads: 1,
  head_dim: 512,         // latent KV 维度（kv_lora_rank）
  hidden_size: 6144,
  max_ctx: 131072,
  // 视觉编码器 32 层 hidden=1280 SwiGLU ≈ 0.85B（额外于 560B 主干）；音频模态本计算器不建模
  vision_encoder_params: 0.85,
  vision_seq_tokens: 5832,  // max_tokens per image in vision/config.json（spatial_merge=1）
  tags: ['chat', 'multilingual', 'reasoning', 'vision', 'audio', 'multimodal'],
  released: '2026-09',
  links: {
    hf: 'https://huggingface.co/meituan-longcat/LongCat-Flash-Omni',
    ms: 'https://modelscope.cn/models/meituan-longcat/LongCat-Flash-Omni',
  },
}
