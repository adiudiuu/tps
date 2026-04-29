// Vicuna 33B: fine-tuned from Llama 33B with user-shared conversations
// Released: March 2023
// Source: https://huggingface.co/lmsys/vicuna-33b-v1.3
export default {
  id: 'vicuna_33b',
  released: '2023-03',
  name: 'Vicuna 33B',
  type: 'dense',
  params: 33.0,
  layers: 60,
  kv_heads: 52,
  head_dim: 128,
  hidden_size: 6656,
  max_ctx: 2048,
  links: {
    ollama: 'ollama pull vicuna:33b',
    hf: 'https://huggingface.co/lmsys/vicuna-33b-v1.3',
  },
}
