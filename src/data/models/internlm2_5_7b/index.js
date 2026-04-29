// InternLM 2.5 7B: dense, 32 layers, 1M ctx
// Source: https://huggingface.co/internlm/internlm2_5-7b/blob/main/config.json
export default {
  id: 'internlm2_5_7b',
  released: '2024-07',
  name: 'InternLM2.5 7B',
  type: 'dense',
  params: 7.7,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 1048576,
  links: {
    hf: 'https://huggingface.co/internlm/internlm2_5-7b-chat',
    ms: 'https://modelscope.cn/models/Shanghai_AI_Laboratory/internlm2_5-7b-chat',
    ollama: 'https://ollama.com/library/internlm2',
  },
}
