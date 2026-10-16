// NVIDIA Nemotron 3.5 Super VL: 120B hybrid LatentMoE / 12B active + C-RADIO vision, 1M context
// 官方 2026-10-15 开源 BF16 权重（OpenMDW-1.1）；主干几何同 Nemotron 3 Super，新增视觉
// 88 层 interleaved Mamba-2 / MoE / attention：40 mamba + 40 moe + 8 attention
// 512 routed experts top-22 + 1 shared；MTP 1 层不计主干
// Official BF16 instruct 仓（另有 Base / NVFP4，不单独入库；Bolt 为压缩蒸馏，不收录）
// Source: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16/blob/main/config.json
// Config: llm_config layers_block_type 88, hidden_size=4096, num_attention_heads=32,
//         num_key_value_heads=2, head_dim=128, n_routed_experts=512, num_experts_per_tok=22,
//         n_shared_experts=1, max_position_embeddings=1048576
// Vision (vision_config / preprocessor): C-RADIO ViT-H/16 depth=32 hidden=1280 mlp_ratio=4
//         patch=16 → ≈0.63B；force_image_size=512 downsample_ratio=0.5 → 一图 256 token
export default {
    id: 'nemotron_3_5_super_vl',
    released: '2026-10',
    name: 'NVIDIA Nemotron 3.5 Super VL (120B-A12B)',
    type: 'moe',
    params: 120,
    active_params: 12,
    experts: 512,
    experts_per_token: 22,
    moe_execution: 'shared_routed',
    layers: 88,
    // 8 attention blocks among 88 interleaved Mamba-2 / MoE / attention blocks
    mamba_ratio: 8 / 88,
    kv_heads: 2,
    head_dim: 128,
    hidden_size: 4096,
    max_ctx: 1048576,
    // C-RADIO ViT-H/16：depth=32, hidden=1280, mlp_ratio=4, patch=16 ≈ 0.63B（不在 120B 主干内）
    vision_encoder_params: 0.63,
    vision_seq_tokens: 256, // (512/16)^2 * 0.5^2；max_num_patches=13312 为动态上限
    tags: ['chat', 'reasoning', 'coding', 'vision', 'multimodal', 'multilingual', 'agentic'],
    links: {
        hf: 'https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16',
        ms: 'https://modelscope.cn/models/NVIDIA/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16',
    },
}
