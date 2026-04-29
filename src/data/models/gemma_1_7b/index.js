// Google Gemma 7B: 28 layers, MHA (16 heads), head_dim=256, 8K ctx
// Source: https://huggingface.co/google/gemma-7b/blob/main/config.json
export default {
  id: 'gemma_1_7b',
  released: '2024-02',
  name: 'Gemma 7B',
  type: 'dense',
  params: 8.5,
  layers: 28,
  kv_heads: 16,
  head_dim: 256,
  hidden_size: 3072,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/google/gemma-7b-it',
    ms: 'https://modelscope.cn/models/AI-ModelScope/gemma-7b-it',
    ollama: 'https://ollama.com/library/gemma',
  },
}
