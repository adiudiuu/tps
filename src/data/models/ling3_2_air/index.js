// Ling-3.2-air: 124B-A5.5B MoE (百灵 BailingMoeV3-VL)，KDA linear + Gated MLA 混合，原生多模态
// 相对已入库 Ling-3.0-flash-VL：同 124B-A5.5B / 42 层 5:1 几何，本窗口公开 3.2-air 权重；config 原生 ctx 262144
// 42 层：35 KDA 线性层不占标准 KV + 7 MLA 全注意力层；512 routed experts top-8 + 1 shared；前 2 层 dense
// Open weights: 2026-11-23（HF + ModelScope，官方 FP8 checkpoint，MIT）
// Source: https://huggingface.co/inclusionAI/Ling-3.2-air/blob/main/config.json
// Config text_config: num_hidden_layers=42, hidden_size=2560, num_attention_heads=32,
//         num_key_value_heads=32, head_dim=128, kv_lora_rank=512, qk_rope_head_dim=64,
//         num_experts=512, num_experts_per_tok=8, layer_group_size=6,
//         first_k_dense_replace=2, max_position_embeddings=262144
// Vision (qwen3_moe_vit): depth=27, hidden=1152, intermediate=4304, patch=16, spatial_merge=2,
//         num_position_embeddings=2304 → 编码器约 0.4B，每图最大 2304/2² = 576 视觉 token
export default {
    id: 'ling3_2_air',
    name: 'Ling-3.2-air (124B-A5.5B)',
    type: 'moe',
    params: 124,
    active_params: 5.5,
    experts: 512,
    experts_per_token: 8,
    moe_execution: 'shared_routed',
    layers: 42,
    linear_attention_layers: 35, // KDA 线性层，不计标准 KV cache
    local_layers: 35,
    sliding_window: 0,
    // 7 层 Gated MLA：每 token 每层缓存 kv_lora_rank(512) + qk_rope_head_dim(64) = 576，基线 2 × 32 × 128 = 8192
    mla_ratio: 0.0703,  // 576 / 8192
    query_heads: 32,     // num_attention_heads；hidden/head_dim 推不出（2560/128=20）
    kv_heads: 32,
    head_dim: 128,
    hidden_size: 2560,
    max_ctx: 262144,     // config 原生 max_position_embeddings；卡面 serving 256K
    vision_encoder_params: 0.4,
    vision_seq_tokens: 576,
    tags: ['chat', 'multilingual', 'coding', 'reasoning', 'vision', 'multimodal', 'agentic'],
    released: '2026-11',
    links: {
        hf: 'https://huggingface.co/inclusionAI/Ling-3.2-air',
        ms: 'https://modelscope.cn/models/inclusionAI/Ling-3.2-air',
    },
}
