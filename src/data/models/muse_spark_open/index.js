// Muse Spark Open: Meta 816B-A42B sparse MoE VLM, 官方 2026-10-15 开源权重（Muse Model License）
// HF 仓 gated：页面 200，但 /resolve|/raw|/blob config.json 均 401；几何不以 HF config 为准
// 主干几何（层数 / Q·KV 头 / head_dim / hidden / experts top-k / 1M ctx / 816B-A42B / ViT 1.8B）
// 均读自下列公开 200 官方文案，未推断：
//   - Model card README：https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
//     Language Model: layers=62, hidden=8192, Q=128, KV=16, head_dim=64, experts=256 top-8
//     Perception Encoder: 1.8B, 50 layers, hidden=1536, 16 heads, patch 14×14
//   - HF 官方博客：https://huggingface.co/blog/meta-muse-spark-open
//     同上，并写明 max_position_embeddings=1048576；dense FFN 整层换成 256 experts top-8（无 shared）
// 滑动窗分层（46 sliding window=2048 + 16 full）与 num_shared_experts=0 读自
// 官方仓在 ModelScope 的公开 config.json（curl GET 200，与 gated HF 同源）：
//   https://modelscope.cn/api/v1/models/meta-models/Muse-Spark-Open-816B-A42B/repo?Revision=master&FilePath=config.json
// Official BF16 仓（另有 NVFP4 仓，不单独入库）；音频编码器仅 tags 标注、不建模
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
    // 官方 model card / 博客：Perception Encoder 1.8B；816B 为 MoE 主干，视觉另计。音频不建模
    vision_encoder_params: 1.8,
    vision_seq_tokens: 4096, // processor max_image_tokens（ModelScope processor_config.json）
    tags: ['chat', 'reasoning', 'coding', 'vision', 'multimodal', 'agentic', 'multilingual', 'audio'],
    released: '2026-10',
    links: {
        hf: 'https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B',
        ms: 'https://modelscope.cn/models/meta-models/Muse-Spark-Open-816B-A42B',
    },
}
