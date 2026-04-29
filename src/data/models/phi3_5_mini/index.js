// Phi-3.5 Mini 3.8B: dense, 32 layers, MHA (32 heads), 128K ctx
// Source: https://huggingface.co/microsoft/Phi-3.5-mini-instruct/blob/main/config.json
export default {
  id: 'phi3_5_mini',
  released: '2024-08',
  name: 'Phi-3.5 Mini 3.8B',
  type: 'dense',
  params: 3.82,
  layers: 32,
  kv_heads: 32,
  head_dim: 96,
  hidden_size: 3072,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull phi3.5',
    hf: 'https://huggingface.co/microsoft/Phi-3.5-mini-instruct',
    ms: 'https://modelscope.cn/models/LLM-Research/Phi-3.5-mini-instruct',
  },
}
