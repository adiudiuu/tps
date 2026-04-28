export default {
  id: 'llama2_13b',
  released: '2023-07',
  name: 'Llama 2 13B',
  type: 'dense',
  params: 13,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 4096,
  links: {
    ollama: 'ollama pull llama2:13b',
    hf: 'https://huggingface.co/meta-llama/Llama-2-13b-chat-hf',
    ms: 'https://modelscope.cn/models/LLM-Research/Llama-2-13b-chat-hf',
  },
}
