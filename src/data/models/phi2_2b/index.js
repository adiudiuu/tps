export default {
  id: 'phi2_2b',
  released: '2023-12',
  name: 'Phi-2 2.7B',
  type: 'dense',
  params: 2.7,
  layers: 32,
  kv_heads: 32,
  head_dim: 80,
  hidden_size: 2560,
  max_ctx: 2048,
  links: {
    ollama: 'ollama pull phi',
    hf: 'https://huggingface.co/microsoft/phi-2',
    ms: 'https://modelscope.cn/models/AI-ModelScope/phi-2',
  },
}
