// Phi-4 14B: dense, 40 layers, GQA (40 heads / 10 KV heads), 16K ctx
// Source: https://huggingface.co/microsoft/phi-4/blob/main/config.json
export default {
  id: 'phi4_14b',
  released: '2024-12',
  name: 'Phi-4 14B',
  type: 'dense',
  params: 14.0,
  layers: 40,
  kv_heads: 10,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 16384,
  links: {
    ollama: 'ollama pull phi4',
    hf: 'https://huggingface.co/microsoft/phi-4',
    ms: 'https://modelscope.cn/models/LLM-Research/phi-4',
  },
}
