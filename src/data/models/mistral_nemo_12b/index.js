// Mistral Nemo 12B: dense, 40 layers, GQA (32 heads / 8 KV heads), 128K ctx
// Source: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407/blob/main/config.json
export default {
  id: 'mistral_nemo_12b',
  released: '2024-07',
  name: 'Mistral Nemo 12B',
  type: 'dense',
  params: 12.2,
  layers: 40,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull mistral-nemo',
    hf: 'https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407',
    ms: 'https://modelscope.cn/models/LLM-Research/Mistral-Nemo-Instruct-2407',
  },
}
