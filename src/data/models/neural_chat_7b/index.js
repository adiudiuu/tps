// Neural Chat 7B: Intel's fine-tuned Mistral 7B for chat
// Released: November 2023
// Source: https://huggingface.co/Intel/neural-chat-7b-v3-3
export default {
  id: 'neural_chat_7b',
  released: '2023-11',
  name: 'Neural Chat 7B v3.3',
  type: 'dense',
  params: 7.2,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 32768,
  links: {
    ollama: 'ollama pull neural-chat',
    hf: 'https://huggingface.co/Intel/neural-chat-7b-v3-3',
  },
}
