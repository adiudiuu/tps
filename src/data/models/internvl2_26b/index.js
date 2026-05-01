// InternVL2 26B: Shanghai AI Lab vision-language model
// Source: https://huggingface.co/OpenGVLab/InternVL2-26B
export default {
  id: 'internvl2_26b',
  released: '2024-07',
  name: 'InternVL2 26B',
  type: 'dense',
  params: 25.5,
  layers: 48,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/OpenGVLab/InternVL2-26B',
    ms: 'https://modelscope.cn/models/OpenGVLab/InternVL2-26B',
  },
}
