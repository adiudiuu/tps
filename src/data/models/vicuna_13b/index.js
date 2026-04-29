// Vicuna 13B: fine-tuned from Llama 2 13B with user-shared conversations
// Released: March 2023
// Source: https://huggingface.co/lmsys/vicuna-13b-v1.5
export default {
  id: 'vicuna_13b',
  released: '2023-03',
  name: 'Vicuna 13B',
  type: 'dense',
  params: 13.0,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 4096,
  links: {
    ollama: 'ollama pull vicuna:13b',
    hf: 'https://huggingface.co/lmsys/vicuna-13b-v1.5',
  },
}
