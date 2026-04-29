// Chinese-LLaMA-2 13B: larger Chinese-optimized Llama 2
// Released: August 2023
// Source: https://huggingface.co/ziqingyang/chinese-llama-2-13b
export default {
  id: 'chinese_llama2_13b',
  released: '2023-08',
  name: 'Chinese-LLaMA-2 13B',
  type: 'dense',
  params: 13.0,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/ziqingyang/chinese-llama-2-13b',
    ms: 'https://modelscope.cn/models/ziqingyang/chinese-llama-2-13b',
  },
}
