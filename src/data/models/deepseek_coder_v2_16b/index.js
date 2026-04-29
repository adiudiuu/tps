// DeepSeek-Coder-V2 Lite 16B: MoE, 16B total / 2.4B active, 338 languages, 128K ctx
// Source: https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct
export default {
  id: 'deepseek_coder_v2_16b',
  released: '2024-06',
  name: 'DeepSeek-Coder-V2 Lite 16B',
  type: 'moe',
  params: 16,
  active_params: 2.4,
  layers: 27,
  kv_heads: 16,
  head_dim: 128,
  hidden_size: 2048,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull deepseek-coder-v2:16b',
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct',
  },
}
