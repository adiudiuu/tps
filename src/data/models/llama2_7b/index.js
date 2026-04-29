// Llama 2 7B: 32 layers, MHA (32 heads), 4K ctx
// Source: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf/blob/main/config.json
export default {
  id: 'llama2_7b',
  released: '2023-07',
  name: 'Llama 2 7B',
  type: 'dense',
  params: 6.7,
  layers: 32,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/meta-llama/Llama-2-7b-chat-hf',
    ms: 'https://modelscope.cn/models/modelscope/Llama-2-7b-chat-ms',
    ollama: 'https://ollama.com/library/llama2',
  },
}
