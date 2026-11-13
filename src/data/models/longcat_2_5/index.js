// LongCat-2.5: 1.6T MoE / 48B active, MLA + DSA, ScMoE, 原生多模态
// 美团 LongCat 官方通用多模态基座；仓创建 2026-11-04，本窗口 config / 权重均 HTTP 200
// （lastModified 2026-11-10）；MIT；官方卡 1.6T / 约 48B active（HF 自动统计 1.8T 含额外模块，取官方卡）
// 38 层：768 routed experts top-12 + 128 identity zero experts；moe_impl=mix（dense FFN 并行 routed）
// MLA：kv_lora_rank=512 + qk_rope_head_dim=64；DSA index_topk=2048（不扩展 calc.js）
// 原生 MTP 3 层供投机解码，不单独入库
// Source: https://huggingface.co/meituan-longcat/LongCat-2.5/blob/main/config.json
// Config: num_layers=38, hidden_size=8192, num_attention_heads=64, attention_method=MLA,
//         kv_lora_rank=512, qk_rope_head_dim=64, q_lora_rank=1536, v_head_dim=128,
//         n_routed_experts=768, moe_topk=12, zero_expert_num=128, moe_impl=mix,
//         ffn_hidden_size=12288, expert_ffn_hidden_size=2048,
//         max_position_embeddings=524288（YaRN original_max=8192, factor=120；取 config 原生）
// Vision (visual_config): 32 层, hidden=1280, intermediate=3420, 16 heads, patch=14,
//         spatial_merge=2, max_pixels=3211264 → 64×64 = 4096 token/图
//         SwiGLU 口径 32×(4×1280²+3×1280×3420)≈0.63B
export default {
    id: 'longcat_2_5',
    name: 'LongCat-2.5 (1.6T-A48B)',
    type: 'moe',
    params: 1600,
    active_params: 48,
    experts: 768,
    experts_per_token: 12,
    moe_execution: 'parallel_dense_routed', // ScMoE：dense FFN 与 routed experts 并行（moe_impl=mix）
    // MLA：每 token 每层缓存 kv_lora_rank(512) + qk_rope_head_dim(64) = 576，基线按 2 × 1 × 512 = 1024
    mla_ratio: 0.5625,  // 576 / 1024
    layers: 38,
    query_heads: 64,     // num_attention_heads；hidden/head_dim 推不出（8192/512=16）
    kv_heads: 1,
    head_dim: 512,       // latent KV 维度（kv_lora_rank）
    hidden_size: 8192,
    max_ctx: 524288,     // config 原生 max_position_embeddings
    vision_encoder_params: 0.63,
    vision_encoder_in_params: true, // 官方 1.6T 为原生多模态总参数
    vision_seq_tokens: 4096,        // max_pixels 3211264 / patch 14 / merge 2 → 64×64
    tags: ['chat', 'coding', 'reasoning', 'vision', 'multimodal', 'agentic'],
    released: '2026-11',
    links: {
        hf: 'https://huggingface.co/meituan-longcat/LongCat-2.5',
        ms: 'https://modelscope.cn/models/meituan-longcat/LongCat-2.5',
    },
}
