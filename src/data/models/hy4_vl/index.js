// Hy4: 770B MoE / 49B active，原生多模态（text / image / video），Gated DSA + IndexCache，1M context
// 相对已入库 Hy4-preview：同 770B-A49B 主干，本窗口权重解禁并加上 1.23B ViT；DFly2 3.3B 草稿不入库
// 78 层：第 1 层 dense FFN，其余 77 层 MoE；256 routed experts top-8 + 1 shared
// Official instruct from Tencent Hy Team；仓创建 2026-10-29，权重本窗口 lastModified 2026-11-20 转公开
// Source: https://huggingface.co/tencent/Hy4/blob/main/config.json
// Config: num_hidden_layers=78, hidden_size=6144, num_attention_heads=64, num_key_value_heads=8,
//         head_dim=64, gated_mla=true, kv_lora_rank=512, qk_rope_head_dim=64, q_lora_rank=2048,
//         n_routed_experts=256, num_experts_per_tok=8, n_shared_experts=1, index_topk=2048,
//         max_position_embeddings=1048576
// 官方卡：Total Parameters (excluding ViT, adapter, and DFly2) 770B；Activated Text 49B + Vision 1.23B
// Vision (vision_config): 40 层, hidden=1536, intermediate=6144, 16 heads, patch=16,
//         spatial_merge=2, img_max_token_num=4096；官方 ViT 1.23B
export default {
    id: 'hy4_vl',
    name: 'Hy4 (770B-A49B)',
    type: 'moe',
    params: 770,
    active_params: 49,
    experts: 256,
    experts_per_token: 8,
    moe_execution: 'shared_routed',
    // Gated MLA：每 token 每层缓存 kv_lora_rank(512) + qk_rope_head_dim(64) = 576，基线 2 × 8 × 64 = 1024
    mla_ratio: 0.5625,  // 576 / 1024
    layers: 78,
    query_heads: 64,     // num_attention_heads；hidden/head_dim 推不出（6144/64=96）
    kv_heads: 8,
    head_dim: 64,
    hidden_size: 6144,
    max_ctx: 1048576,
    vision_encoder_params: 1.23, // 官方卡 ViT；770B 不含 ViT / adapter / DFly2
    vision_seq_tokens: 4096,     // img_max_token_num
    tags: ['chat', 'multilingual', 'reasoning', 'coding', 'agentic', 'vision', 'multimodal'],
    released: '2026-11',
    links: {
        hf: 'https://huggingface.co/tencent/Hy4',
        ms: 'https://modelscope.cn/models/Tencent-Hunyuan/Hy4',
    },
}
