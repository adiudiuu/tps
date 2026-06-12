// Devstral 2 (123B): Mistral 大厂代码专用模型，2025-12-10 发布
// 架构与 Mistral Large 2 (123B) 同构，Apache 2.0
// 88 layers, GQA 96Q/8KV, head_dim 128, hidden 12288
// Source: https://huggingface.co/mistralai/Devstral-2-123B
export default {
  id: 'devstral_2_123b',
  released: '2025-12',
  name: 'Devstral 2 123B',
  type: 'dense',
  params: 123,
  layers: 88,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 12288,
  max_ctx: 131072,
  tags: ['code', 'agentic'],
  links: {
    ollama: 'ollama pull devstral2:123b',
    hf: 'https://huggingface.co/mistralai/Devstral-2-123B',
    ms: 'https://modelscope.cn/models/LLM-Research/Devstral-2-123B',
  },
}
