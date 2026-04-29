// Llama 3.2 Vision 90B: large multimodal model
// Released: September 2024
// Source: https://huggingface.co/meta-llama/Llama-3.2-90B-Vision-Instruct
export default {
  id: 'llama3_2_vision_90b',
  released: '2024-09',
  name: 'Llama 3.2 Vision 90B',
  type: 'dense',
  params: 90.0,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/meta-llama/Llama-3.2-90B-Vision-Instruct',
  },
}
