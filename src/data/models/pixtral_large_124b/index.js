// Pixtral Large 124B: dense multimodal, 基于 Mistral Large 2 (123B) 架构 + 400M vision encoder
// 88 layers, GQA 96Q/8KV, head_dim 128
// vision_seq_tokens 来自 Mistral 官方文档：1x 1024x1024 图 ≈ 1024 patch，512x512 约 256 patch
// Source: https://huggingface.co/mistralai/Pixtral-Large-Instruct-2411
export default {
  id: 'pixtral_large_124b',
  released: '2024-11',
  name: 'Pixtral Large 124B',
  type: 'dense',
  params: 124,
  layers: 88,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 12288,
  max_ctx: 131072,
  vision_encoder_params: 0.4,  // 400M vision encoder (SigLIP-style)
  vision_seq_tokens: 1024,      // 高分辨率图可达 1024 patch tokens
  tags: ['chat', 'multimodal'],
  links: {
    ollama: 'ollama pull pixtral-large',
    hf: 'https://huggingface.co/mistralai/Pixtral-Large-Instruct-2411',
    ms: 'https://modelscope.cn/models/LLM-Research/Pixtral-Large-Instruct-2411',
  },
}
