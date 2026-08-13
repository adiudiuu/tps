// Qwen3-VL-8B: dense VLM, text 36 layers GQA 32Q/8KV, native 256K ctx
// Source: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct/blob/main/config.json
export default {
  id: 'qwen3_vl_8b',
  name: 'Qwen3-VL 8B',
  type: 'dense',
  params: 8.2,
  layers: 36,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 262144,
  tags: ['chat', 'multilingual', 'vision', 'multimodal'],
  // Qwen3-VL：patch 16 + spatial_merge 2 → 32× 压缩；官方 README 推荐单图预算 256–1280
  vision_seq_tokens: 1280,
  released: '2025-10',
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3-VL-8B-Instruct',
  },
}
