// Chinese-LLaMA-2 7B: Chinese-optimized Llama 2
// Released: August 2023
// Source: https://huggingface.co/ziqingyang/chinese-llama-2-7b
export default {
  id: 'chinese_llama2_7b',
  released: '2023-08',
  name: 'Chinese-LLaMA-2 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/ziqingyang/chinese-llama-2-7b',
    ms: 'https://modelscope.cn/models/ziqingyang/chinese-llama-2-7b',
  },
}
