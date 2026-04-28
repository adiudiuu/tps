export default {
  id: 'mixtral_8x7b',
  released: '2023-12',
  name: 'Mixtral 8x7B',
  type: 'moe',
  params: 46.7,
  active_params: 12.9,
  mla_ratio: null,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 32768,
  links: {
    ollama: 'ollama pull mixtral',
    hf: 'https://huggingface.co/mistralai/Mixtral-8x7B-v0.1',
    ms: 'https://modelscope.cn/models/AI-ModelScope/Mixtral-8x7B-v0.1',
  },
}
