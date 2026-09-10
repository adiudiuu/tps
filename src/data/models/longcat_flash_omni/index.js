// LongCat-Flash-Omni: 560B ScMoE / 27B active, MLA attention, zero-computation experts, omni-modal (text/image/video/audio)
// Shortcut-connected MoE (dense FFN 并行 routed experts) + 256 zero-computation(identity) experts；轻量视觉/音频编码器各约 0.6B
// Open weights: 2026-09 (HF + ModelScope, MIT)
// Source: https://huggingface.co/meituan-longcat/LongCat-Flash-Omni/blob/main/config.json
// Config: num_layers=28, hidden_size=6144, num_attention_heads=64, attention_method=MLA,
//         kv_lora_rank=512, qk_rope_head_dim=64, n_routed_experts=512, moe_topk=12, zero_expert_num=256
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
  // 视觉编码器约 0.6B（官方 LLM config 未含多模态几何；音频模态本计算器不建模）
  vision_encoder_params: 0.6,
  tags: ['chat', 'multilingual', 'reasoning', 'vision', 'audio', 'multimodal'],
  released: '2026-09',
  links: {
    hf: 'https://huggingface.co/meituan-longcat/LongCat-Flash-Omni',
    ms: 'https://modelscope.cn/models/meituan-longcat/LongCat-Flash-Omni',
  },
}
