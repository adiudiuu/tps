// Hy4 flash: 220B MoE（含 64B Engram）/ 12B active，原生多模态，Gated DSA + SWA hybrid，1M context
// 42 层：第 1 层 dense FFN + 41 层 MoE；512 routed experts top-16 + 1 shared（LatentMoE）
// 注意力：12 层 Gated DSA + 30 层滑动窗（window=512）；pattern 2×Sparse → 10×(3×SWA→Sparse)
// Official instruct from Tencent Hy Team，仓创建 2026-11-17，权重本窗口公开
// 官方卡 intro：220B total including 64B Engram，12B active；表：backbone 155.5B + Engram 63.5B（不含 ViT / DFly2）
// n-gram/Engram 占权重显存，按 Qwen3.8-Flash-Next 口径计入 params；DFly2 0.85B 草稿不入库
// Source: https://huggingface.co/tencent/Hy4-flash/blob/main/config.json
// Config text_config: num_hidden_layers=42, hidden_size=3072, num_attention_heads=32,
//         num_key_value_heads=32, head_dim=64, gated_mla=true, kv_lora_rank=512,
//         qk_rope_head_dim=64, n_routed_experts=512, num_experts_per_tok=16, n_shared_experts=1,
//         sliding_window=512, swa_num_attention_heads=64, max_position_embeddings=1048576
// Vision (vision_config): 27 层, hidden=1152, intermediate=4304, 16 heads, patch=16,
//         spatial_merge=2, img_max_token_num=4096；官方 ViT 0.43B
export default {
    id: 'hy4_flash',
    name: 'Hy4 flash (220B-A12B)',
    type: 'moe',
    params: 220,         // 155.5B backbone + 63.5B Engram（官方 intro 220B，含 Engram、不含 ViT/DFly2）
    active_params: 12,   // 官方 intro 12B；表 Text 11.3B + Vision 0.43B
    experts: 512,
    experts_per_token: 16,
    moe_execution: 'shared_routed',
    // 12 层 Gated DSA：每 token 每层缓存 kv_lora_rank(512)+qk_rope_head_dim(64)=576，基线 2 × 32 × 64 = 4096
    // text_config 亦 gated_mla/use_mla；引擎对 global+SWA 同乘 mla_ratio（同 DeepSeek V4.1 Flash 混合口径，不扩展引擎）
    mla_ratio: 0.140625, // 576 / 4096
    layers: 42,
    query_heads: 32,     // num_attention_heads；hidden/head_dim 推不出（3072/64=48）；SWA 另有 64 头不另建模
    kv_heads: 32,
    head_dim: 64,
    hidden_size: 3072,
    local_layers: 30,    // sliding_attention
    sliding_window: 512,
    max_ctx: 1048576,
    vision_encoder_params: 0.43, // 官方卡 ViT；220B 不含 ViT
    vision_seq_tokens: 4096,     // img_max_token_num
    tags: ['chat', 'multilingual', 'reasoning', 'coding', 'agentic', 'vision', 'multimodal'],
    released: '2026-11',
    links: {
        hf: 'https://huggingface.co/tencent/Hy4-flash',
        ms: 'https://modelscope.cn/models/Tencent-Hunyuan/Hy4-flash',
    },
}
