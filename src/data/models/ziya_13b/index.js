// Ziya-LLaMA 13B: IDEA-CCNL's Chinese model
// Released: May 2023
// Source: https://huggingface.co/IDEA-CCNL/Ziya-LLaMA-13B-v1
export default {
  id: 'ziya_13b',
  released: '2023-05',
  name: 'Ziya-LLaMA 13B',
  type: 'dense',
  params: 13.0,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 2048,
  links: {
    hf: 'https://huggingface.co/IDEA-CCNL/Ziya-LLaMA-13B-v1',
    ms: 'https://modelscope.cn/models/Fengshenbang/Ziya-LLaMA-13B-v1',
  },
}
