// InternVL2 8B: Shanghai AI Lab vision-language model
// Source: https://huggingface.co/OpenGVLab/InternVL2-8B
export default {
  id: 'internvl2_8b',
  released: '2024-07',
  name: 'InternVL2 8B',
  type: 'dense',
  params: 8.1,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/OpenGVLab/InternVL2-8B',
    ms: 'https://modelscope.cn/models/OpenGVLab/InternVL2-8B',
  },
}
