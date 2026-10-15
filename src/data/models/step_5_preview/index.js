// Step-5-Preview: 600B-A27B sparse MoE VLM (阶跃星辰), 官方 2026-10-15 开源权重
// 92 层混合注意力（3 sliding + 1 full 循环）：69 层滑动窗（window=512）+ 23 层全注意力
// 全注意力层另有 CSA sparse indexer（topk=512），仍按标准 GQA KV 计，不设 mla_ratio
// 352 routed experts top-8 + share_expert_dim=1536；前 3 层 dense（moe_layer_list 3..90）
// layer_types 共 95（含 num_nextn_predict_layers=3 的 MTP），主干按 num_hidden_layers=92
// Official FP8 checkpoint（另有 BF16 / NVFP4 仓，不单独入库）
// Source: https://huggingface.co/stepfun-ai/Step-5-Preview/blob/main/config.json
// Config: text_config num_hidden_layers=92, hidden_size=4096, num_attention_heads=64,
//         num_attention_groups=4, head_dim=192, moe_num_experts=352, num_experts_per_tok=8,
//         sliding_window=512, max_position_embeddings=1048576（与官方宣称 1M 一致）
// Vision (perception_encoder): layers=47, width=1536, heads=16, image_size=728, patch=14,
//         understand_projector_stride=2 → 原生一图 (728/14/2)² = 676 token；
//         image_token_len=169 为默认 tile。BF16 vit.safetensors ≈ 3.96GB → ~2B
export default {
  id: 'step_5_preview',
  name: 'Step-5-Preview (600B-A27B)',
  type: 'moe',
  params: 600,
  active_params: 27,
  experts: 352,
  experts_per_token: 8,
  moe_execution: 'shared_routed',
  layers: 92,
  query_heads: 64,       // num_attention_heads；hidden/head_dim 推不出（4096/192≈21.3）
  kv_heads: 4,           // num_attention_groups（full / sliding 均为 4）
  head_dim: 192,
  hidden_size: 4096,
  local_layers: 69,      // 主干 92 层中的 sliding_attention；MTP 3 层不计
  sliding_window: 512,
  max_ctx: 1048576,
  // Perception Encoder 47×1536 GELU ≈ 2B（独立于 600B MoE 主干）；视频模态本计算器不建模
  vision_encoder_params: 2.0,
  vision_seq_tokens: 676,
  tags: ['chat', 'reasoning', 'coding', 'agentic', 'vision', 'multimodal', 'multilingual'],
  released: '2026-10',
  links: {
    hf: 'https://huggingface.co/stepfun-ai/Step-5-Preview',
    ms: 'https://modelscope.cn/models/stepfun-ai/Step-5-Preview',
  },
}
