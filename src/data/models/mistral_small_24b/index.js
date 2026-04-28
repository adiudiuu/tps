// Mistral Small 3.1 24B: dense, 40 layers, GQA (32 heads / 8 KV heads), 128K ctx
// Source: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503/blob/main/config.json
export default {
  id: 'mistral_small_24b',
  released: '2025-03',
  name: 'Mistral Small 3.1 24B',
  type: 'dense',
  params: 24.0,
  layers: 40,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull mistral-small3.1',
    hf: 'https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503',
    ms: 'https://modelscope.cn/models/LLM-Research/Mistral-Small-3.1-24B-Instruct-2503',
  },
}
