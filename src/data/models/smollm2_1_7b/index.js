// SmolLM2 1.7B: dense, 24 layers, 8K ctx
// Source: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B/blob/main/config.json
export default {
  id: 'smollm2_1_7b',
  released: '2024-11',
  name: 'SmolLM2 1.7B',
  type: 'dense',
  params: 1.7,
  layers: 24,
  kv_heads: 4,
  head_dim: 64,
  hidden_size: 2048,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B',
    ms: 'https://modelscope.cn/models/HuggingFaceTB/SmolLM2-1.7B',
  },
}
