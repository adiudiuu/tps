// Llama 3.2 11B Vision: multimodal, text+image input, 128K ctx
// Source: https://huggingface.co/meta-llama/Llama-3.2-11B-Vision
export default {
  id: 'llama3_2_11b',
  released: '2024-09',
  name: 'Llama 3.2 11B Vision',
  type: 'dense',
  params: 11,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull llama3.2-vision:11b',
    hf: 'https://huggingface.co/meta-llama/Llama-3.2-11B-Vision',
  },
}
