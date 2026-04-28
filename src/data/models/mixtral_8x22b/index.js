export default {
  id: 'mixtral_8x22b',
  released: '2024-04',
  name: 'Mixtral 8x22B',
  type: 'moe',
  params: 141,
  active_params: 39,
  mla_ratio: null,
  layers: 56,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 6144,
  max_ctx: 65536,
  links: {
    ollama: 'ollama pull mixtral:8x22b',
    hf: 'https://huggingface.co/mistralai/Mixtral-8x22B-v0.1',
    ms: 'https://modelscope.cn/models/AI-ModelScope/Mixtral-8x22B-v0.1',
  },
}
