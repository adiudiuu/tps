// Kimi K3.1 Pro: 2.8T MoE / 104B active, KDA + Gated DSA hybrid attention, 1M context
// Post-trained from Kimi K3; API 2026-10-23，官方权重 2026-11-04（BUN-65 时仓/config 仍 401）
// 93 层：69 KDA 线性注意力 + 24 Gated DSA（相对 K3，全注意力 Gated MLA 换成 Gated DSA）
// 896 routed experts top-16 + 2 shared，前 1 层 dense FFN；hidden=7168，96 attn heads
// Native MXFP4 weights / MXFP8 activations；MoonViT-V2 vision encoder（官方卡 401M）
// Highspeed / DSpark / DFlash2 变体不单独入库
// Source: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/config.json
// Config text_config: num_hidden_layers=93, hidden_size=7168, num_attention_heads=96,
//         kv_lora_rank=512, qk_rope_head_dim=64, q_lora_rank=1536,
//         num_experts=896, num_experts_per_tok=16, num_shared_experts=2,
//         first_k_dense_replace=1, max_position_embeddings=1048576
//         linear_attn_config.kda_layers=69, dsa_config.dsa_layers=24（与 full_attn_layers 同集）
// Vision (vision_config / MoonViT-V2): vt_num_hidden_layers=27, vt_hidden_size=1024,
//         patch_size=14, merge_kernel_size=2×2, init_pos_emb 64×64 → 合并后 32×32 = 1024 token/图
export default {
    id: 'kimi_k3_1_pro',
    name: 'Kimi K3.1 Pro (MoE)',
    type: 'moe',
    params: 2800,
    active_params: 104,
    experts: 896,
    experts_per_token: 16,
    moe_execution: 'shared_routed',
    layers: 93,
    // 69 KDA 线性注意力层：不占标准 KV cache（recurrent state）
    local_layers: 69,
    sliding_window: 0,
    linear_attention_layers: 69,
    // 24 层 Gated DSA 仍用 MLA latent KV：每 token 每层缓存 kv_lora_rank(512)+qk_rope_head_dim(64)=576
    // kv_heads × head_dim 按 latent（1 × 512）填写，ratio 补 rope 分量（同 K3 / DeepSeek HCA）
    mla_ratio: 0.5625,  // (512 + 64) / (2 × 1 × 512)
    query_heads: 96,     // num_attention_heads；hidden/head_dim 推不出（7168/512=14）
    kv_heads: 1,
    head_dim: 512,
    hidden_size: 7168,
    max_ctx: 1048576,
    // MoonViT-V2：官方卡 401M；patch 14、merge 2×2；init_pos_emb 64×64 → 32×32 = 1024 token/图
    vision_encoder_params: 0.401,
    vision_seq_tokens: 1024,
    tags: ['chat', 'coding', 'agentic', 'vision', 'multimodal', 'multilingual'],
    released: '2026-11',
    links: {
        hf: 'https://huggingface.co/moonshotai/Kimi-K3.1-Pro',
        ms: 'https://modelscope.cn/models/moonshotai/Kimi-K3.1-Pro',
    },
}
