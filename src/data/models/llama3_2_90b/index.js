// Llama 3.2 90B Vision: multimodal, text+image input, 128K ctx
// Source: https://huggingface.co/meta-llama/Llama-3.2-90B-Vision
export default {
  id: 'llama3_2_90b',
  released: '2024-09',
  name: 'Llama 3.2 90B Vision',
  type: 'dense',
  params: 90,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 131072,
  // Vision encoder: ViT-H cross-attention, ~2.5B params, 1601 tokens per image
  vision_encoder_params: 2.5,
  vision_seq_tokens: 1601,
  links: {
    ollama: 'ollama pull llama3.2-vision:90b',
    hf: 'https://huggingface.co/meta-llama/Llama-3.2-90B-Vision',
  },
}
