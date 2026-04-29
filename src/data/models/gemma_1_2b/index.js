// Google Gemma 2B: 18 layers, MQA (8 heads / 1 KV head), head_dim=256, 8K ctx
// Source: https://huggingface.co/google/gemma-2b/blob/main/config.json
export default {
  id: 'gemma_1_2b',
  released: '2024-02',
  name: 'Gemma 2B',
  type: 'dense',
  params: 2.5,
  layers: 18,
  kv_heads: 1,
  head_dim: 256,
  hidden_size: 2048,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/google/gemma-2b-it',
    ms: 'https://modelscope.cn/models/AI-ModelScope/gemma-2b-it',
    ollama: 'https://ollama.com/library/gemma:2b',
  },
}
