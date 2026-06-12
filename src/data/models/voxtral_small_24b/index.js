// Voxtral Small 24B: dense audio-language model (Mistral 首个开源音频模型)
// 基于 Mistral Small 3 24B 同构 + audio encoder
// 2025-07-15 发布，Apache 2.0
// Source: https://huggingface.co/mistralai/Voxtral-Small-24B-2507
export default {
  id: 'voxtral_small_24b',
  released: '2025-07',
  name: 'Voxtral Small 24B',
  type: 'dense',
  params: 24.0,
  layers: 40,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 32768,  // 音频上下文：约 40 分钟语音
  tags: ['audio', 'multimodal'],
  links: {
    ollama: null,
    hf: 'https://huggingface.co/mistralai/Voxtral-Small-24B-2507',
    ms: null,
  },
}
