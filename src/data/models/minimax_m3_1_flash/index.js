// MiniMax M3.1 Flash: ~428B MoE / ~23B active，原生多模态；官方 2026-10-23 开源权重
// 保留 M3 主干（60 层、128 routed top-4 + 1 shared、hidden 6144），三处变化：
//   1) MiniMax Sparse Attention（MSA）贯穿全部 60 层（sparse_attention_freq 全 1）
//      仍为 GQA KV（kv_heads=4, head_dim=128），不是 MLA，不设 mla_ratio
//   2) 量化感知训练（routed experts NVFP4 / 其余 MXFP8）；本仓即官方权重，不另收量化变体
//   3) DSpark 投机解码草稿头（dspark/），不计主干
// 前 3 层 dense（moe_layer_freq 0），其余 MoE
// num_attention_heads=64，hidden/head_dim=6144/128=48，推不出 Q 头数，显式 query_heads
// max_ctx 取 config 原生 max_position_embeddings=1048576（与官方宣称 1M 一致）
// Source: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash/blob/main/config.json
// Config: text_config layers=60, hidden_size=6144, num_attention_heads=64,
//         num_key_value_heads=4, head_dim=128, num_local_experts=128,
//         num_experts_per_tok=4, n_shared_experts=1, max_position_embeddings=1048576
// Vision (vision_config): CLIP-style 32×1280 / intermediate 5120 / patch=14 / image_size=672
//         spatial_merge_size=2 → image_seq_length=576（与 config 字段一致）
//         428B 为官方 native multimodal 总参（同 MiniMax M3 口径），视觉不另加
export default {
    id: 'minimax_m3_1_flash',
    name: 'MiniMax M3.1 Flash',
    type: 'moe',
    params: 428,
    active_params: 23,
    experts: 128,
    experts_per_token: 4,
    moe_execution: 'shared_routed',
    layers: 60,
    query_heads: 64,     // num_attention_heads；hidden/head_dim 推不出（6144/128=48）
    kv_heads: 4,
    head_dim: 128,
    hidden_size: 6144,
    max_ctx: 1048576,
    vision_seq_tokens: 576,
    tags: ['chat', 'coding', 'agentic', 'vision', 'multimodal'],
    released: '2026-10',
    links: {
        hf: 'https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash',
        ms: 'https://modelscope.cn/models/MiniMax/MiniMax-M3.1-Flash',
    },
}
