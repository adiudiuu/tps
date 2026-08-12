// Inkling: 975B MoE / 41B active, hybrid local/global attention, native text+image+audio
// Released: 2026-07-15 (Thinking Machines Lab), Apache 2.0
// 66 layers: 55 local SWA (window=512, 16 KV heads) + 11 global (8 KV heads); 256E top-6 + 2 shared
// Source: https://huggingface.co/thinkingmachines/Inkling/blob/main/config.json
export default {
  id: 'inkling',
  name: 'Inkling (975B-A41B)',
  type: 'moe',
  params: 975,
  active_params: 41,
  experts: 256,
  experts_per_token: 6,
  moe_execution: 'shared_routed',
  layers: 66,
  // local_layer_ids in config: 55 sliding layers; every 6th layer is global
  local_layers: 55,
  sliding_window: 512,
  kv_heads: 16,          // SWA (swa_num_key_value_heads)
  head_dim: 128,
  global_kv_heads: 8,    // global (num_key_value_heads)
  global_head_dim: 128,
  hidden_size: 6144,
  max_ctx: 1048576,
  // hMLP patch encoder: patch_size=40; 1024×1024 → (1024/40)² ≈ 655 tokens/image
  vision_seq_tokens: 655,
  tags: ['chat', 'reasoning', 'coding', 'multilingual', 'vision', 'multimodal'],
  released: '2026-07',
  links: {
    hf: 'https://huggingface.co/thinkingmachines/Inkling',
  },
}
