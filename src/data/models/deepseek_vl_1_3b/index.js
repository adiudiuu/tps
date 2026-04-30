// DeepSeek-VL 1.3B: compact vision-language model
// Released: March 2024
// Source: https://huggingface.co/deepseek-ai/deepseek-vl-1.3b-base
export default {
  id: 'deepseek_vl_1_3b',
  released: '2024-03',
  name: 'DeepSeek-VL 1.3B',
  type: 'dense',
  params: 1.3,
  layers: 24,
  kv_heads: 16,
  head_dim: 128,
  hidden_size: 2048,
  max_ctx: 4096,
  // Vision encoder: SigLIP-L/14 ~0.3B params, 576 patch tokens per image
  vision_encoder_params: 0.3,
  vision_seq_tokens: 576,
  links: {
    hf: 'https://huggingface.co/deepseek-ai/deepseek-vl-1.3b-base',
    ms: 'https://modelscope.cn/models/deepseek-ai/deepseek-vl-1.3b-base',
  },
}
