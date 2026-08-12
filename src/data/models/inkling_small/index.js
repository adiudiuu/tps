// Inkling-Small: 276B MoE / 12B active, same family as Inkling, native text+image+audio
// Released: 2026-07-30 (Thinking Machines Lab), Apache 2.0
// 42 layers: 35 local SWA (window=512) + 7 global; 256E top-6 + 2 shared; hidden=4096
// Source: https://huggingface.co/thinkingmachines/Inkling-Small/blob/main/config.json
export default {
  id: 'inkling_small',
  name: 'Inkling-Small (276B-A12B)',
  type: 'moe',
  params: 276,
  active_params: 12,
  experts: 256,
  experts_per_token: 6,
  moe_execution: 'shared_routed',
  layers: 42,
  local_layers: 35,
  sliding_window: 512,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 1048576,
  // Same hMLP patch encoder as Inkling (patch_size=40)
  vision_seq_tokens: 655,
  tags: ['chat', 'reasoning', 'coding', 'multilingual', 'vision', 'multimodal'],
  released: '2026-07',
  links: {
    hf: 'https://huggingface.co/thinkingmachines/Inkling-Small',
  },
}
