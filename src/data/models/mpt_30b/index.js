// MPT 30B: larger MosaicML model
// Released: June 2023
// Source: https://huggingface.co/mosaicml/mpt-30b
export default {
  id: 'mpt_30b',
  released: '2023-06',
  name: 'MPT 30B',
  type: 'dense',
  params: 30.0,
  layers: 48,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 7168,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/mosaicml/mpt-30b',
  },
}
