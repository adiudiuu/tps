// ERNIE-5.5-Flash-Preview: 280B MoE / 14B active，Flash Base 的 post-train 中间 checkpoint
// 仓创建 2026-11-23 09:00 UTC，本窗口 config / 权重均 HTTP 200（Apache-2.0）；FP8 / BF16 同几何不单独入库
// 与 Base 同架构同 tokenizer：43 层（1 dense + 42 MoE），37 HCA + 6 MLA-DSA，512 routed top-10 + 1 shared
// 官方卡：Preview 是未完成 post-train 的中间权重，另加 DSpark 草稿头（不计主干）
// Source: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview/blob/main/config.json
// Config: num_hidden_layers=43, hidden_size=4096, num_attention_heads=64,
//         num_key_value_heads=1, head_dim=512, kv_lora_rank=512, qk_rope_head_dim=64,
//         n_routed_experts=512, num_experts_per_tok=10, n_shared_experts=1,
//         first_k_dense_replace=1, max_position_embeddings=1048576
//         compress_ratios：43 层中 37×128（HCA）+ 6×-2（MLA-DSA）
export default {
    id: 'ernie55_flash_preview',
    name: 'ERNIE 5.5 Flash Preview (280B-A14B)',
    type: 'moe',
    params: 280,
    active_params: 14,
    experts: 512,
    experts_per_token: 10,
    moe_execution: 'shared_routed',
    // 37 HCA + 6 MLA-DSA 均按 latent KV：每 token 每层缓存 kv_lora_rank(512)+qk_rope_head_dim(64)=576
    // kv_heads × head_dim 按 HCA/MQA latent（1 × 512）填写，ratio 补 rope 分量（同 Flash Base / DeepSeek V4 Flash）
    mla_ratio: 0.5625,  // (512 + 64) / (2 × 1 × 512)
    query_heads: 64,     // num_attention_heads；hidden/head_dim 推不出（4096/512=8）
    layers: 43,
    kv_heads: 1,
    head_dim: 512,
    hidden_size: 4096,
    max_ctx: 1048576,    // config 原生 max_position_embeddings
    tags: ['chat', 'multilingual', 'coding', 'reasoning', 'math', 'agentic'],
    released: '2026-11',
    links: {
        hf: 'https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview',
        ms: 'https://modelscope.cn/models/baidu/ERNIE-5.5-Flash-Preview',
    },
}
