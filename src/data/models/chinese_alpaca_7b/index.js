// Chinese-Alpaca 7B: instruction-tuned Chinese model
// Released: March 2023
// Source: https://huggingface.co/ziqingyang/chinese-alpaca-lora-7b
export default {
  id: 'chinese_alpaca_7b',
  released: '2023-03',
  name: 'Chinese-Alpaca 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/ziqingyang/chinese-alpaca-lora-7b',
    ms: 'https://modelscope.cn/models/ziqingyang/chinese-alpaca-lora-7b',
  },
}
