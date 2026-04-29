// InternLM2-7B: 32 layers, GQA (32 heads / 8 KV heads), 32K ctx
// Source: https://huggingface.co/internlm/internlm2-chat-7b/blob/main/config.json
export default {
  id: 'internlm2_7b',
  released: '2024-01',
  name: 'InternLM2 7B',
  type: 'dense',
  params: 7.7,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/internlm/internlm2-chat-7b',
    ms: 'https://modelscope.cn/models/Shanghai_AI_Laboratory/internlm2-chat-7b',
    ollama: 'https://ollama.com/library/internlm2:7b',
  },
}
