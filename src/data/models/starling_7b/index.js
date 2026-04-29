// Starling 7B Alpha: RLAIF-trained model based on OpenChat
// Released: November 2023
// Source: https://huggingface.co/berkeley-nest/Starling-LM-7B-alpha
export default {
  id: 'starling_7b',
  released: '2023-11',
  name: 'Starling 7B Alpha',
  type: 'dense',
  params: 7.2,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 8192,
  links: {
    ollama: 'ollama pull starling-lm',
    hf: 'https://huggingface.co/berkeley-nest/Starling-LM-7B-alpha',
  },
}
