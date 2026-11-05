// ERNIE-5.5-Flash-Base: 280B MoE / 14B active，预训练基座（无 mid/post-train）
// 仓创建 2026-10-21；官方卡 / config / 权重本窗口转公开（config lastModified 2026-11-05）
// 43 层：第 1 层 dense FFN + 42 层 Multi-Router Latent MoE；37 HCA + 6 MLA-DSA
// 512 routed experts top-10 + 1 shared；hidden=4096，64 attn heads
// Official card: 280B / 14B（含 embedding+lm_head，不含 ECHO 0.36B）；原生 FP8，另有同几何 BF16 仓不单独入库
// HCA：compress_ratios=128，每 128 token 缓存 1 条；calc.js 无 HCA 压缩字段，KV 按 DeepSeek V4 Flash
//       同口径（MLA latent / 全层 mla_ratio），不把 HCA 写成 sliding_window（长上下文会低估）
// Source: https://huggingface.co/baidu/ERNIE-5.5-Flash-Base/blob/main/config.json
// Config: num_hidden_layers=43, hidden_size=4096, num_attention_heads=64,
//         num_key_value_heads=1, head_dim=512, kv_lora_rank=512, qk_rope_head_dim=64,
//         n_routed_experts=512, num_experts_per_tok=10, n_shared_experts=1,
//         first_k_dense_replace=1, max_position_embeddings=1048576
//         compress_ratios：43 层中 37×128（HCA）+ 6×-2（MLA-DSA）；另 1 条 MTP/ECHO 不计主干
//         hybrid_mla_*: kv_lora_rank=512, qk_rope_head_dim=64, v_head_dim=256, attention=mqa_dsa
export default {
    id: 'ernie55_flash_base',
    name: 'ERNIE 5.5 Flash Base (280B-A14B)',
    type: 'moe',
    params: 280,
    active_params: 14,
    experts: 512,
    experts_per_token: 10,
    moe_execution: 'shared_routed',
    // 37 HCA + 6 MLA-DSA 均按 latent KV：每 token 每层缓存 kv_lora_rank(512)+qk_rope_head_dim(64)=576
    // kv_heads × head_dim 按 HCA/MQA latent（1 × 512）填写，ratio 补 rope 分量（同 DeepSeek V4 Flash）
    mla_ratio: 0.5625,  // (512 + 64) / (2 × 1 × 512)
    query_heads: 64,     // num_attention_heads；hidden/head_dim 推不出（4096/512=8）
    layers: 43,
    kv_heads: 1,
    head_dim: 512,
    hidden_size: 4096,
    max_ctx: 1048576,    // config 原生 max_position_embeddings；卡面训练 128K / 推理 1M
    tags: ['chat', 'multilingual', 'coding', 'reasoning', 'math'],
    released: '2026-11',
    links: {
        hf: 'https://huggingface.co/baidu/ERNIE-5.5-Flash-Base',
        ms: 'https://modelscope.cn/models/baidu/ERNIE-5.5-Flash-Base',
    },
}
