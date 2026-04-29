// Linly 7B: Chinese conversational model
// Released: May 2023
// Source: https://huggingface.co/Linly-AI/Chinese-LLaMA-2-7B-hf
export default {
  id: 'linly_7b',
  released: '2023-05',
  name: 'Linly 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/Linly-AI/Chinese-LLaMA-2-7B-hf',
    ms: 'https://modelscope.cn/models/Linly-AI/Chinese-LLaMA-2-7B-hf',
  },
}
