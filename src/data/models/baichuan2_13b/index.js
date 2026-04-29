// Baichuan2-13B: 40 layers, MHA (40 heads), 4K ctx
// Source: https://huggingface.co/baichuan-inc/Baichuan2-13B-Chat/blob/main/config.json
export default {
  id: 'baichuan2_13b',
  released: '2023-09',
  name: 'Baichuan2-13B',
  type: 'dense',
  params: 13.3,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/baichuan-inc/Baichuan2-13B-Chat',
    ms: 'https://modelscope.cn/models/baichuan-inc/Baichuan2-13B-Chat',
    ollama: 'https://ollama.com/library/baichuan2',
  },
}
