// Phi-4 Mini 3.8B: dense, 32 layers, GQA (24 heads / 8 KV heads), 16K ctx
// Source: https://huggingface.co/microsoft/Phi-4-mini-instruct/blob/main/config.json
export default {
  id: 'phi4_mini',
  released: '2025-02',
  name: 'Phi-4 Mini 3.8B',
  type: 'dense',
  params: 3.84,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 3072,
  max_ctx: 16384,
  links: {
    ollama: 'ollama pull phi4-mini',
    hf: 'https://huggingface.co/microsoft/Phi-4-mini-instruct',
    ms: 'https://modelscope.cn/models/LLM-Research/Phi-4-mini-instruct',
  },
}
