// Mistral Large 4 (Le Chonk): 1.05T MoE / 52B active, MLA + DSA, 原生多模态，1M context
// 官方 2026-10-29 开源权重（Mistral Ecosystem Open-Weight License）；HF 仓此前 Upcoming / config 401
// 72 层：第 1 层 dense FFN，其余 71 层 MoE；128 routed experts top-4 + 1 shared
// params.json head_dim=128（qk_nope 64 + qk_rope 64）；transformers text_config.head_dim=64 为 nope 维
// num_attention_heads=64，hidden/head_dim=6144/128=48，推不出 Q 头数，显式 query_heads
// max_ctx 取 config 原生 max_position_embeddings=1048576（与官方宣称 1M 一致；YaRN 512×2048）
// 官方卡：49B active per token（52B including embeddings and output layers）→ 按 A52B / 文档 52B
// 总参取官方文档 1.05T（HF 别名仓 Mistral-Large-4.0-1T05-A52B）；1.6B Pixtral 视觉另计
// DSpark / MTP 草稿头、NVFP4 / GGUF 量化变体不单独入库
// Source: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/config.json
//         https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/params.json
// Config text_config: layers=72, hidden_size=6144, num_attention_heads=64,
//         num_key_value_heads=64, kv_lora_rank=512, qk_rope_head_dim=64, qk_head_dim=128,
//         n_routed_experts=128, num_experts_per_tok=4, n_shared_experts=1,
//         max_position_embeddings=1048576
// Vision (vision_config / params.json vision_encoder): Pixtral 30×2048 / intermediate 6144 /
//         16 heads / patch=14 / image_size=1540 / spatial_merge_size=2
//         官方文档 1.6B vision encoder；一图 55×55 = 3025 patch token
export default {
    id: 'mistral_large_4',
    name: 'Mistral Large 4 (1.05T-A52B)',
    type: 'moe',
    params: 1050,
    active_params: 52,
    experts: 128,
    experts_per_token: 4,
    moe_execution: 'shared_routed',
    // MLA：每 token 每层缓存 kv_lora_rank(512) + qk_rope_head_dim(64) = 576
    // 基线按 params.json head_dim=128：2 × kv_heads(64) × 128 = 16384
    mla_ratio: 0.0352,  // 576 / 16384
    layers: 72,
    query_heads: 64,     // num_attention_heads；hidden/head_dim 推不出（6144/128=48）
    kv_heads: 64,
    head_dim: 128,
    hidden_size: 6144,
    max_ctx: 1048576,
    // Pixtral：image_size 1540 / patch_size 14 = 110，spatial_merge_size 2 → 55×55
    vision_encoder_params: 1.6,
    vision_seq_tokens: 3025,
    tags: ['chat', 'reasoning', 'coding', 'vision', 'multimodal', 'multilingual', 'agentic'],
    released: '2026-10',
    links: {
        hf: 'https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B',
    },
}
