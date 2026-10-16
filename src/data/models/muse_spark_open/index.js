// Muse Spark Open: Meta 816B-A42B sparse MoE VLM, 官方 2026-10-15 开源权重（Muse Model License，HF gated）
// 62 层混合注意力：46 sliding_attention（window=2048）+ 16 full GQA；全部 62 层 sparse MoE
// 256 routed experts top-8，无 shared expert；hidden=8192，GQA 128Q/16KV head_dim=64
// Official BF16 仓（另有 NVFP4 仓，不单独入库）
// Source: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B/blob/main/config.json
// Config: text_config num_hidden_layers=62, hidden_size=8192, num_attention_heads=128,
//         num_key_value_heads=16, head_dim=64, num_local_experts=256, num_experts_per_tok=8,
//         num_shared_experts=0, sliding_window=2048, max_position_embeddings=1048576（与官方 1M 一致）
// Vision (vision_config / processor): ViT-G/14 depth=50 hidden=1536 intermediate=8960 patch=14
//         merge_size=2 → 约 1.85B；max_image_tokens=4096。音频编码器仅 tags 标注、不建模
export default {
    id: 'muse_spark_open',
    name: 'Muse Spark Open (816B-A42B)',
    type: 'moe',
    params: 816,
    active_params: 42,
    experts: 256,
    experts_per_token: 8,
    layers: 62,
    kv_heads: 16,
    head_dim: 64,
    hidden_size: 8192,
    local_layers: 46,      // sliding_attention
    sliding_window: 2048,
    max_ctx: 1048576,
    // ViT-G/14：depth=50, hidden=1536, intermediate=8960, patch=14, merge=2 ≈ 1.85B
    // 816B 为 MoE 主干；perception encoder 另计。音频不建模
    vision_encoder_params: 1.8,
    vision_seq_tokens: 4096, // processor max_image_tokens
    tags: ['chat', 'reasoning', 'coding', 'vision', 'multimodal', 'agentic', 'multilingual', 'audio'],
    released: '2026-10',
    links: {
        hf: 'https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B',
        ms: 'https://modelscope.cn/models/meta-models/Muse-Spark-Open-816B-A42B',
    },
}
