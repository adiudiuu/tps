// DeepSeek Janus 1.3B: unified multimodal understanding and generation
// Released: February 2025
// Source: https://huggingface.co/deepseek-ai/Janus-1.3B
export default {
  id: 'deepseek_janus_1_3b',
  released: '2025-02',
  name: 'DeepSeek Janus 1.3B',
  type: 'dense',
  params: 1.3,
  layers: 24,
  kv_heads: 16,
  head_dim: 128,
  hidden_size: 2048,
  max_ctx: 4096,
  tags: ['multilingual', 'vision'],
  // vision: SigLIP-Large-Patch16-384 → (384/16)² = 576；transformers JanusVisionConfig.num_image_tokens=576
  vision_encoder_params: 0.3,
  vision_seq_tokens: 576,
  links: {
    hf: 'https://huggingface.co/deepseek-ai/Janus-1.3B',
    ms: 'https://modelscope.cn/models/deepseek-ai/Janus-1.3B',
  },
}
