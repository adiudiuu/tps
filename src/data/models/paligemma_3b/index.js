// PaliGemma 3B: vision-language model
// Released: May 2024
// Source: https://huggingface.co/google/paligemma-3b-pt-224
export default {
  id: 'paligemma_3b',
  released: '2024-05',
  name: 'PaliGemma 3B',
  type: 'dense',
  params: 3.0,
  layers: 26,
  kv_heads: 16,
  head_dim: 256,
  hidden_size: 2048,
  max_ctx: 8192,
  tags: ['vision'],
  // PaliGemma-3B-pt-224：SigLIP patch14 @ 224×224 → (224/14)² = 256
  // Source: Hugging Face PaliGemma blog / model card
  vision_encoder_params: 0.4,
  vision_seq_tokens: 256,
  links: {
    hf: 'https://huggingface.co/google/paligemma-3b-pt-224',
  },
}
