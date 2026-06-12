// Devstral Small 2 (24B): Mistral 大厂代码专用模型，2025-12-10 发布
// 架构与 Mistral Small 3.1 24B 同构，Apache 2.0
// 40 layers, GQA, hidden 5120, kv_heads 8, head_dim 128
// Source: https://huggingface.co/mistralai/Devstral-Small-2-24B
export default {
  id: 'devstral_small_2_24b',
  released: '2025-12',
  name: 'Devstral Small 2 24B',
  type: 'dense',
  params: 24.0,
  layers: 40,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 131072,
  tags: ['code', 'agentic'],
  links: {
    ollama: 'ollama pull devstral-small2:24b',
    hf: 'https://huggingface.co/mistralai/Devstral-Small-2-24B',
    ms: 'https://modelscope.cn/models/LLM-Research/Devstral-Small-2-24B',
  },
}
