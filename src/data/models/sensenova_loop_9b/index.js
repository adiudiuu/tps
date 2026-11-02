// SenseNova-Loop-9B-Preview: 商汤 SenseNova 开源循环多模态稠密 VLM，~9B unique / 推理展开约 14.6B
// 官方 2026-10-30 发布；BUN-63 时官方仓/config 仍 401，本轮窗口内页面与 config.json 转 200（Apache-2.0）
// 32 层 hybrid（full_attention_interval=4）：24 线性注意力不占标准 KV + 8 全注意力；GQA 16Q/4KV head_dim=256
// loop_settings: layers [4, 28) 权重共享执行 2 次 → 56 次 decoder 前向（calc 按 unique 32 层 / 9B 权重计 VRAM）
// max_ctx 取 text_config 原生 max_position_embeddings=262144（训练序列 256K）
// MTP 草稿头、DSpark / DFlash2（训练中）不单独入库
// Source: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview/blob/main/config.json
// Config text_config: num_hidden_layers=32, hidden_size=4096, num_attention_heads=16,
//         num_key_value_heads=4, head_dim=256, full_attention_interval=4,
//         max_position_embeddings=262144, model_type=qwen3_5_text
// Vision (vision_config / qwen3_5_vision): depth=27, hidden=1152, intermediate=4304,
//         patch=16, spatial_merge=2, num_position_embeddings=2304
//         → 编码器约 0.4B；每图最大 2304/2² = 576 视觉 token
export default {
    id: 'sensenova_loop_9b',
    name: 'SenseNova-Loop 9B Preview',
    type: 'dense',
    params: 9,
    layers: 32,
    kv_heads: 4,
    head_dim: 256,
    linear_attention_layers: 24, // 线性注意力层，不计标准 KV cache
    local_layers: 24,
    sliding_window: 0,
    hidden_size: 4096,
    max_ctx: 262144,
    vision_encoder_params: 0.4,
    vision_seq_tokens: 576,
    tags: ['chat', 'multilingual', 'coding', 'vision', 'multimodal', 'agentic'],
    released: '2026-10',
    links: {
        hf: 'https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview',
        ms: 'https://modelscope.cn/models/sensenova/SenseNova-Loop-9B-Preview',
    },
}
