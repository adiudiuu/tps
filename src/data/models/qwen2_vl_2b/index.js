// Qwen2-VL 2B: compact vision-language model
// Released: August 2024
// Source: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
export default {
  id: 'qwen2_vl_2b',
  released: '2024-08',
  name: 'Qwen2-VL 2B',
  type: 'dense',
  params: 2.0,
  layers: 28,
  kv_heads: 2,
  head_dim: 64,
  hidden_size: 1536,
  max_ctx: 32768,
  tags: ['multilingual', 'vision'],
  // Qwen2-VL：patch 14 + merge 2 → 每 token≈28×28；官方 README 推荐平衡预算 256–1280
  // Source: Qwen/Qwen2-VL-* Instruct README + preprocessor_config (patch_size 14, merge_size 2)
  vision_seq_tokens: 1280,
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct',
    ms: 'https://modelscope.cn/models/qwen/Qwen2-VL-2B-Instruct',
  },
}
