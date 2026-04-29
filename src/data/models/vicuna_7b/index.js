// Vicuna 7B: fine-tuned from Llama 2 7B with user-shared conversations
// Released: March 2023
// Source: https://huggingface.co/lmsys/vicuna-7b-v1.5
export default {
  id: 'vicuna_7b',
  released: '2023-03',
  name: 'Vicuna 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    ollama: 'ollama pull vicuna:7b',
    hf: 'https://huggingface.co/lmsys/vicuna-7b-v1.5',
  },
}
