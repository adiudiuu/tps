// Llama 3.2 Vision 11B: multimodal model
// Released: September 2024
// Source: https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct
export default {
  id: 'llama3_2_vision_11b',
  released: '2024-09',
  name: 'Llama 3.2 Vision 11B',
  type: 'dense',
  params: 11.0,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  // Vision encoder: ViT-H (cross-attention style), ~2.5B params
  // image_size=560, patch_size=14 → 40×40 + cls = 1601 patch tokens per image
  vision_encoder_params: 2.5,
  vision_seq_tokens: 1601,
  links: {
    hf: 'https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct',
  },
}
