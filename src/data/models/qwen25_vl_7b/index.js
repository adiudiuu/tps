// Qwen2.5-VL 7B: Alibaba vision-language model
// Source: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
export default {
  id: 'qwen25_vl_7b',
  released: '2025-01',
  name: 'Qwen2.5-VL 7B',
  type: 'dense',
  params: 8.3,
  layers: 28,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 3584,
  max_ctx: 32768,
  tags: ['multilingual', 'vision'],
  // Qwen2.5-VL：patch 14 + merge 2 → 每 token≈28×28；官方 README 推荐平衡预算 256–1280
  // Source: Qwen/Qwen2.5-VL-* Instruct README + preprocessor_config (patch_size 14, merge_size 2)
  vision_seq_tokens: 1280,
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct',
    ms: 'https://modelscope.cn/models/Qwen/Qwen2.5-VL-7B-Instruct',
    ollama: 'ollama pull qwen2.5vl:7b',
  },
}
