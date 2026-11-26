// Inkling 2 Small: 594B MoE / 17B active, hybrid local+global attention, 原生多模态
// Thinking Machines 官方通用多模态基座；仓创建 2026-11-04，BUN-67/68 时权重仍关闭
// 本窗口 config / 权重均 HTTP 200（lastModified 2026-11-12）；主仓为原生 NVFP4，MXFP8 同几何不单独入库
// 48 层：40 层局部滑动窗（window=1024）+ 8 层全局；384 routed experts top-8，无 shared
// Official card: 594B total, 17B active；Apache 2.0；宣称上下文 1M（config model_max_length=1048576）
// 相对注意力 (d_rel) / short-conv 不扩展 calc.js，KV 按现有 GQA + sliding_window 口径
// ModelScope 本窗口转公开（API/页面 HTTP 200），补 links.ms
// Source: https://huggingface.co/thinkingmachines/Inkling-2-Small/blob/main/config.json
// Config text_config: num_hidden_layers=48, hidden_size=4608, num_attention_heads=48,
//         num_key_value_heads=8, head_dim=128, n_routed_experts=384, num_experts_per_tok=8,
//         n_shared_experts=0, sliding_window_size=1024, local_layer_ids 40 层,
//         model_max_length=1048576
// Vision (vision_config): 23 层 ViT, hidden=1024, 16 heads, mlp_ratio=4, native_patch=20,
//         adapter_merge_size=2, posemb_grid_size=32 → 32×32 = 1024 token/图；约 0.29B
export default {
    id: 'inkling_2_small',
    name: 'Inkling 2 Small (594B-A17B)',
    type: 'moe',
    params: 594,
    active_params: 17,
    experts: 384,
    experts_per_token: 8,
    moe_execution: 'routed',
    mla_ratio: null,
    layers: 48,
    query_heads: 48,     // num_attention_heads；hidden/head_dim 推不出（4608/128=36）
    kv_heads: 8,
    head_dim: 128,
    hidden_size: 4608,
    local_layers: 40,    // local_layer_ids 计数；每 6 层中 5 局部 + 1 全局
    sliding_window: 1024,
    max_ctx: 1048576,    // config 原生 model_max_length；卡面 1M
    vision_encoder_params: 0.29,
    vision_encoder_in_params: true, // 官方 594B 为含 ViT 的总参数
    vision_seq_tokens: 1024,        // posemb_grid_size=32 → 32×32
    tags: ['chat', 'coding', 'reasoning', 'vision', 'multimodal', 'multilingual', 'agentic'],
    released: '2026-11',
    links: {
        hf: 'https://huggingface.co/thinkingmachines/Inkling-2-Small',
        ms: 'https://modelscope.cn/models/thinkingmachines/Inkling-2-Small',
    },
}
