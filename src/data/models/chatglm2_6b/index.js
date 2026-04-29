// ChatGLM2 6B: improved bilingual model with longer context
// Released: June 2023
// Source: https://huggingface.co/THUDM/chatglm2-6b
export default {
  id: 'chatglm2_6b',
  released: '2023-06',
  name: 'ChatGLM2 6B',
  type: 'dense',
  params: 6.0,
  layers: 28,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/THUDM/chatglm2-6b',
    ms: 'https://modelscope.cn/models/ZhipuAI/chatglm2-6b',
  },
}
