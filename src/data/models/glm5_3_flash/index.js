// GLM-5.3-Flash: 320B MoE / 18B active, KDA linear + sparse MLA hybrid, 1M context, native VLM
// 45 layers: 34 KDA linear + 11 IndexShare sparse MLA (full_attn_layers); first 3 MLP dense then MoE
// 288 routed experts top-8 + 1 shared; hidden=4096, MLA kv_lora_rank=512
// Open weights: 2026-08 (HF + ModelScope, MIT)
// Source: https://huggingface.co/zai-org/GLM-5.3-Flash/blob/main/config.json
export default {
  id: 'glm5_3_flash',
  name: 'GLM-5.3-Flash (320B-A18B)',
  type: 'moe',
  params: 320,
  active_params: 18,
  experts: 288,
  experts_per_token: 8,
  moe_execution: 'shared_routed',
  layers: 45,
  linear_attention_layers: 34, // KDA，不计标准 KV cache
  local_layers: 34,
  sliding_window: 0,
  // 11 层 sparse MLA：kv_lora_rank(512) + qk_rope_head_dim(0)；基线 2 × 64 × 256
  mla_ratio: 0.015625,  // 512 / 32768
  kv_heads: 64,
  head_dim: 256,
  hidden_size: 4096,
  max_ctx: 1048576,
  // ViT: depth=24, hidden=1024, patch=14, spatial_merge=2；官方未单独披露 ViT 参数量
  vision_encoder_params: 0.5,
  vision_seq_tokens: 256,  // image_size 448 / patch 14 / merge 2 → 16×16
  tags: ['chat', 'reasoning', 'coding', 'multilingual', 'vision', 'multimodal'],
  released: '2026-08',
  links: {
    hf: 'https://huggingface.co/zai-org/GLM-5.3-Flash',
    ms: 'https://modelscope.cn/models/ZhipuAI/GLM-5.3-Flash',
  },
}
