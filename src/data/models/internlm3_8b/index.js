// InternLM 3 8B: dense, 32 layers, GQA (32 heads / 8 KV heads), 128K ctx
// Source: https://huggingface.co/internlm/internlm3-8b-instruct/blob/main/config.json
export default {
  id: 'internlm3_8b',
  released: '2025-01',
  name: 'InternLM 3 8B',
  type: 'dense',
  params: 8.0,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull internlm3',
    hf: 'https://huggingface.co/internlm/internlm3-8b-instruct',
    ms: 'https://modelscope.cn/models/Shanghai_AI_Laboratory/internlm3-8b-instruct',
  },
}
