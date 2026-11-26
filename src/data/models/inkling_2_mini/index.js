// Inkling 2 Mini: 26.4B MoE / 3.4B active，looped hybrid local+global attention，原生多模态
// Thinking Machines 官方通用多模态基座；仓创建 2026-11-17，本窗口 config / 权重均 HTTP 200（Apache 2.0）
// 24 层 unique：20 层局部滑动窗（window=1024）+ 4 层全局；中间 12 层（core 6–18）权重共享执行 3 次
// 官方：每多一圈约 +1.0B effective active → 三圈共 5.4B effective；VRAM 按 unique 26.4B / 3.4B（同 SenseNova-Loop）
// 128 routed experts top-8，无 shared；主仓原生 NVFP4；TML-d24-varloop-research 研究变体不入库
// Source: https://huggingface.co/thinkingmachines/Inkling-2-Mini/blob/main/config.json
// Config text_config: num_hidden_layers=24, hidden_size=2304, num_attention_heads=24,
//         num_key_value_heads=8, head_dim=128, n_routed_experts=128, num_experts_per_tok=8,
//         n_shared_experts=0, sliding_window_size=1024, local_layer_ids 20 层,
//         loop_config core_start=6 core_end=18 num_passes=3, model_max_length=1048576
// Vision (vision_config): 23 层 ViT, hidden=1024, 16 heads, mlp_ratio=4, native_patch=20,
//         adapter_merge_size=2, posemb_grid_size=32 → 32×32 = 1024 token/图；约 0.29B
export default {
    id: 'inkling_2_mini',
    name: 'Inkling 2 Mini (26.4B-A3.4B)',
    type: 'moe',
    params: 26.4,
    active_params: 3.4,
    experts: 128,
    experts_per_token: 8,
    moe_execution: 'routed',
    mla_ratio: null,
    layers: 24,          // unique 权重层；loop 展开不另加层（calc 按 unique 计 VRAM）
    query_heads: 24,     // num_attention_heads；hidden/head_dim 推不出（2304/128=18）
    kv_heads: 8,
    head_dim: 128,
    hidden_size: 2304,
    local_layers: 20,    // local_layer_ids 计数；每 6 层中 5 局部 + 1 全局
    sliding_window: 1024,
    max_ctx: 1048576,    // config 原生 model_max_length；卡面 1M
    vision_encoder_params: 0.29,
    vision_encoder_in_params: true, // 官方 26.4B 为含 ViT 的总参数
    vision_seq_tokens: 1024,        // posemb_grid_size=32 → 32×32
    tags: ['chat', 'coding', 'reasoning', 'vision', 'multimodal', 'multilingual', 'agentic'],
    released: '2026-11',
    links: {
        hf: 'https://huggingface.co/thinkingmachines/Inkling-2-Mini',
        ms: 'https://modelscope.cn/models/thinkingmachines/Inkling-2-Mini',
    },
}
