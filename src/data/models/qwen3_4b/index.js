// Qwen3 4B: dense, 36 layers, GQA (32 heads / 8 KV heads), 128K ctx
// Source: https://huggingface.co/Qwen/Qwen3-4B/blob/main/config.json
export default {
  id: 'qwen3_4b',
  released: '2025-04',
  name: 'Qwen3 4B',
  type: 'dense',
  params: 4.0,
  layers: 36,
  query_heads: 32, // num_attention_heads；HF Qwen/Qwen3-4B
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 2560,
  max_ctx: 131072,
  tags: ['chat', 'multilingual'],
  links: {
    ollama: 'ollama pull qwen3:4b',
    hf: 'https://huggingface.co/Qwen/Qwen3-4B',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3-4B',
  },
}
