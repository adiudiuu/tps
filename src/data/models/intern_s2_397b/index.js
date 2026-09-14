// Intern-S2-397B: Shanghai AI Lab 科学智能多模态 MoE（Qwen3.5-MoE 几何），原生 VLM，262K ctx
// 60 层 hybrid（45 GatedDeltaNet linear + 15 full attention，full_attention_interval=4）
// 512 routed experts top-10 + 1 shared；hidden=4096，GQA 32Q/2KV head_dim=256
// Official open weights: 2026-09-13, Apache-2.0；HF 卡显示约 403B（397B 语言 + ViT / MTP）
// Source: https://huggingface.co/internlm/Intern-S2-397B/blob/main/config.json
// text_config: num_hidden_layers=60, hidden_size=4096, num_attention_heads=32,
//         num_key_value_heads=2, head_dim=256, num_experts=512, num_experts_per_tok=10,
//         moe_intermediate_size=1024, shared_expert_intermediate_size=1024,
//         max_position_embeddings=262144
// Vision (vision_config): depth=27, hidden_size=1152, intermediate_size=4304,
//         patch_size=16, spatial_merge_size=2, num_position_embeddings=2304
export default {
  id: 'intern_s2_397b',
  name: 'Intern-S2-397B (397B-A17B)',
  type: 'moe',
  params: 397,
  active_params: 17, // 与同几何 Qwen3.5-397B-A17B 一致：512 experts top-10 + shared
  experts: 512,
  experts_per_token: 10,
  moe_execution: 'shared_routed',
  layers: 60,
  linear_attention_layers: 45, // GatedDeltaNet
  local_layers: 45,
  sliding_window: 0,
  kv_heads: 2,
  head_dim: 256,
  hidden_size: 4096,
  max_ctx: 262144,
  // ViT: depth=27, hidden=1152, intermediate=4304, patch=16, spatial_merge=2
  vision_encoder_params: 0.8,
  vision_seq_tokens: 1280,
  tags: ['chat', 'multilingual', 'reasoning', 'vision', 'multimodal', 'agentic', 'math'],
  released: '2026-09',
  links: {
    hf: 'https://huggingface.co/internlm/Intern-S2-397B',
    ms: 'https://modelscope.cn/models/Shanghai_AI_Laboratory/Intern-S2-397B',
  },
}
