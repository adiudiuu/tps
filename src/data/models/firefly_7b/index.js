// Firefly 7B: Chinese instruction-following model
// Released: June 2023
// Source: https://huggingface.co/YeungNLP/firefly-llama2-7b
export default {
  id: 'firefly_7b',
  released: '2023-06',
  name: 'Firefly 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/YeungNLP/firefly-llama2-7b',
    ms: 'https://modelscope.cn/models/YeungNLP/firefly-llama2-7b',
  },
}
