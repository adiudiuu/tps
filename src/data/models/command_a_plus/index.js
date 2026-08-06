// Command A+: 218B MoE / 25B active, 128 routed + 4 shared experts, 200K context
// Source: https://huggingface.co/CohereLabs/command-a-plus-05-2026-bf16/blob/main/config.json
export default {
  id: 'command_a_plus',
  name: 'Command A+',
  type: 'moe',
  params: 218,
  active_params: 25,
  experts: 128,
  experts_per_token: 8,
  moe_execution: 'shared_routed',
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  local_layers: 24,
  sliding_window: 4096,
  max_ctx: 200000,
  tags: ['chat', 'multilingual', 'vision', 'multimodal'],
  // vision: SigLIP patch16-512 + downsample_factor 2 → 每 tile 256 token（与 Command A Vision 同构）
  // Source: HF preprocessor_config (img_size 512, patch_size 16, downsample_factor 2);
  //         Command A Vision model card: 256 visual tokens per 512×512 tile
  vision_encoder_params: 0.4,
  vision_seq_tokens: 256,
  released: '2026-05',
  links: {
    hf: 'https://huggingface.co/CohereLabs/command-a-plus-05-2026-bf16',
  },
}
