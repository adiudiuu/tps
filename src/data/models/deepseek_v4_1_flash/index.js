// DeepSeek-V4.1-Flash: 552B MoE backbone / 8B prefill + 16B decode active, CED + CSA2, native VLM, 1M context
// 40 层 Causal Encoder-Decoder（20 encoder + 20 decoder）；384 routed experts top-6 + 1 shared
// 另有 Engram 条件记忆 196B（按 token 稀疏查表，不计入 backbone / params）
// Official open weights: 2026-09-10, MIT
// Source: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/config.json
// text_config: num_hidden_layers=40, hidden_size=5120, num_attention_heads=64,
//         num_key_value_heads=1, head_dim=512（latent KV）, qk_rope_head_dim=64,
//         n_routed_experts=384, num_experts_per_tok=6, n_shared_experts=1,
//         sliding_window=128, kv_source_layer_ids=[2,8,14,20], max_position_embeddings=1048576
// Vision (vision_config): num_hidden_layers=32, hidden_size=1024, num_attention_heads=16,
//         intermediate_size=2816, patch_size=14, downsample_ratio=3, max_image_tokens=1024
export default {
  id: 'deepseek_v4_1_flash',
  name: 'DeepSeek V4.1 Flash (552B-A16B)',
  type: 'moe',
  params: 552,
  active_params: 16, // 官方 8B prefill / 16B decode；TPS 按 decode
  experts: 384,
  experts_per_token: 6,
  moe_execution: 'shared_routed',
  // head_dim=512 即 latent KV 维度，实际缓存 512 + qk_rope_head_dim(64) = 576，基线为 2 × 1 × 512
  mla_ratio: 0.5625,  // 576 / 1024
  layers: 40,
  query_heads: 64,       // num_attention_heads；hidden/head_dim 推不出（5120/512=10）
  kv_heads: 1,
  head_dim: 512,
  hidden_size: 5120,
  // 仅 4 层写全局 KV（kv_source_layer_ids）；其余层 SWA window=128
  local_layers: 36,
  sliding_window: 128,
  max_ctx: 1048576,
  // DeepSeek-ViT 32 层 hidden=1024 intermediate=2816 + 2 层 projector ≈ 0.4B（不在 552B backbone 内）
  vision_encoder_params: 0.4,
  vision_seq_tokens: 1024,  // max_image_tokens in vision_config
  tags: ['chat', 'multilingual', 'coding', 'reasoning', 'vision', 'multimodal', 'agentic'],
  released: '2026-09',
  links: {
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-V4.1-Flash',
  },
}
