// DeepSeek-V4-Flash-Vision-Exp: 305B MoE / 13B active, V4-Flash-0731 base + vision encoder & aligner, 1M context
// Experimental VLM: image+text in, text out; MIT license, open weights 2026-08-31
// Text backbone same as DeepSeek-V4-Flash-0731 (284B + ~21B vision ≈ 305B total per HF model card)
// Source: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
// Config: num_hidden_layers=43, hidden_size=4096, num_attention_heads=64,
//         num_key_value_heads=1 (HCA), head_dim=512 (latent KV dim),
//         n_routed_experts=256, num_experts_per_tok=6, n_shared_experts=1
// Vision: vision_n_layers=32, vision_dim=1024, vision_n_heads=16, vision_inter_dim=2816,
//         vision_patch_size=14, vision_downsample_ratio=3, vision_max_n_token=384
export default {
  id: 'deepseek_v4_flash_vision_exp',
  name: 'DeepSeek V4 Flash Vision Exp',
  type: 'moe',
  params: 305,
  active_params: 13,
  experts: 256,
  experts_per_token: 6,
  moe_execution: 'shared_routed',
  // head_dim=512 即 latent KV 维度，实际缓存 512 + qk_rope_head_dim(64) = 576，基线为 2 × 1 × 512
  mla_ratio: 0.5625,  // 576 / 1024
  layers: 43,
  query_heads: 64,       // num_attention_heads；hidden/head_dim 推不出（4096/512=8）
  kv_heads: 1,
  head_dim: 512,
  hidden_size: 4096,
  max_ctx: 1048576,
  // vision encoder + aligner ≈ 21B（305B HF total − 284B text base）
  vision_encoder_params: 21,
  vision_encoder_in_params: true,
  vision_seq_tokens: 384,  // vision_max_n_token in config.json
  tags: ['chat', 'multilingual', 'coding', 'reasoning', 'vision', 'multimodal'],
  released: '2026-08',
  links: {
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp',
  },
}
