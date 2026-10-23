// NVIDIA Nemotron 3.5 Bolt E4B: Gemma-4-E4B 后训练稠密 SLM，8B 总参 / 4B effective
// 官方 2026-10-23 开源 BF16 权重（OpenMDW-1.1）；几何同 Gemma 4 E4B 滑动+全局注意力
// 42 层 5:1：35 sliding_attention（window=512）+ 7 full_attention
// local: kv_heads=2, head_dim=256 / global: global_head_dim=512（num_global_key_value_heads 为空，同 local=2）
// max_ctx 取 text_config 原生 max_position_embeddings=65536（官方卡片 Input/Output 均为 64K）
// 官方 Inputs/Outputs 为 Text/text；config 虽带 Gemma 4 vision/audio 块，部署示例 limit-mm=0，不建模视觉/音频
// Official BF16 instruct 仓（另有 4GB Q4_K_M GGUF / DFlash 草稿，不单独入库）
// Source: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16/blob/main/config.json
// Config: text_config num_hidden_layers=42, hidden_size=2560, num_attention_heads=8,
//         num_key_value_heads=2, head_dim=256, global_head_dim=512, sliding_window=512,
//         max_position_embeddings=65536, enable_moe_block=false
export default {
    id: 'nemotron_3_5_bolt_e4b',
    released: '2026-10',
    name: 'NVIDIA Nemotron 3.5 Bolt E4B (8B)',
    type: 'dense',
    params: 8,
    layers: 42,
    query_heads: 8,         // num_attention_heads；hidden/head_dim 推不出（2560/256=10）
    kv_heads: 2,            // local (sliding) attention KV heads
    head_dim: 256,
    global_head_dim: 512,   // global attention head dim（global_kv_heads 同 local = 2）
    local_layers: 35,       // sliding window layer count
    sliding_window: 512,    // local attention window size (tokens)
    hidden_size: 2560,
    max_ctx: 65536,
    tags: ['chat', 'reasoning', 'coding', 'multilingual', 'agentic'],
    links: {
        hf: 'https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16',
    },
}
