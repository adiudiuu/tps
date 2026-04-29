// Llama 2 70B: 80 layers, GQA (64 heads / 8 KV heads), 4K ctx
// Source: https://huggingface.co/meta-llama/Llama-2-70b-chat-hf/blob/main/config.json
export default {
  id: 'llama2_70b',
  released: '2023-07',
  name: 'Llama 2 70B',
  type: 'dense',
  params: 70.0,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/meta-llama/Llama-2-70b-chat-hf',
    ms: 'https://modelscope.cn/models/modelscope/Llama-2-70b-chat-ms',
    ollama: 'https://ollama.com/library/llama2:70b',
  },
}
