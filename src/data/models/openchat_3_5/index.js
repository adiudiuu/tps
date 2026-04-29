// OpenChat 3.5: fine-tuned Mistral 7B with C-RLFT
// Released: November 2023
// Source: https://huggingface.co/openchat/openchat-3.5-0106
export default {
  id: 'openchat_3_5',
  released: '2023-11',
  name: 'OpenChat 3.5',
  type: 'dense',
  params: 7.2,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 8192,
  links: {
    ollama: 'ollama pull openchat',
    hf: 'https://huggingface.co/openchat/openchat-3.5-0106',
  },
}
