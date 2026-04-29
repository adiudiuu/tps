// ChatGLM3-6B: 28 layers, GQA (32 heads / 2 KV heads), 32K ctx
// Source: https://huggingface.co/THUDM/chatglm3-6b/blob/main/config.json
export default {
  id: 'chatglm3_6b',
  released: '2023-10',
  name: 'ChatGLM3-6B',
  type: 'dense',
  params: 6.2,
  layers: 28,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/THUDM/chatglm3-6b',
    ms: 'https://modelscope.cn/models/ZhipuAI/chatglm3-6b',
    ollama: 'https://ollama.com/library/chatglm3',
  },
}
