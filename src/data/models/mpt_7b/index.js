// MPT-7B: 32 layers, MHA (32 heads), ALiBi positional encoding, 2K ctx
// Source: https://huggingface.co/mosaicml/mpt-7b/blob/main/config.json
export default {
  id: 'mpt_7b',
  released: '2023-05',
  name: 'MPT-7B',
  type: 'dense',
  params: 6.7,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/mosaicml/mpt-7b-instruct',
    ms: 'https://modelscope.cn/models/AI-ModelScope/mpt-7b-instruct',
    ollama: 'https://ollama.com/library/mpt',
  },
}
