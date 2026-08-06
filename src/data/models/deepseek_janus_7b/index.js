// DeepSeek Janus 7B: larger unified multimodal model
// Released: February 2025
// Source: https://huggingface.co/deepseek-ai/Janus-7B
export default {
  id: 'deepseek_janus_7b',
  released: '2025-02',
  name: 'DeepSeek Janus 7B',
  type: 'dense',
  params: 7.0,
  layers: 30,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  tags: ['multilingual', 'vision'],
  // vision: SigLIP-Large-Patch16-384 → (384/16)² = 576；transformers JanusVisionConfig.num_image_tokens=576
  vision_encoder_params: 0.3,
  vision_seq_tokens: 576,
  links: {
    hf: 'https://huggingface.co/deepseek-ai/Janus-7B',
    ms: 'https://modelscope.cn/models/deepseek-ai/Janus-7B',
  },
}
