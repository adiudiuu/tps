// ChatGLM 6B: bilingual conversational model
// Released: March 2023
// Source: https://huggingface.co/THUDM/chatglm-6b
export default {
  id: 'chatglm_6b',
  released: '2023-03',
  name: 'ChatGLM 6B',
  type: 'dense',
  params: 6.0,
  layers: 28,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/THUDM/chatglm-6b',
    ms: 'https://modelscope.cn/models/ZhipuAI/chatglm-6b',
  },
}
