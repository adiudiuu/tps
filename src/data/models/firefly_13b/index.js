// Firefly 13B: larger Chinese instruction model
// Released: June 2023
// Source: https://huggingface.co/YeungNLP/firefly-llama2-13b
export default {
  id: 'firefly_13b',
  released: '2023-06',
  name: 'Firefly 13B',
  type: 'dense',
  params: 13.0,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/YeungNLP/firefly-llama2-13b',
    ms: 'https://modelscope.cn/models/YeungNLP/firefly-llama2-13b',
  },
}
