// Chinese-Alpaca 13B: larger instruction-tuned Chinese model
// Released: March 2023
// Source: https://huggingface.co/ziqingyang/chinese-alpaca-lora-13b
export default {
  id: 'chinese_alpaca_13b',
  released: '2023-03',
  name: 'Chinese-Alpaca 13B',
  type: 'dense',
  params: 13.0,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/ziqingyang/chinese-alpaca-lora-13b',
    ms: 'https://modelscope.cn/models/ziqingyang/chinese-alpaca-lora-13b',
  },
}
