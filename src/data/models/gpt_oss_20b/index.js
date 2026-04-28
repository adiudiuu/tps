// gpt-oss-20b: MoE, 24 layers, 32 experts top-4, GQA 64Q/8KV, sliding_window=128 (every 2nd layer)
// 21B total params, 3.6B active params
// Source: https://huggingface.co/openai/gpt-oss-20b/blob/main/original/config.json
export default {
  id: 'gpt_oss_20b',
  released: '2025-08',
  name: 'GPT-OSS 20B',
  type: 'moe',
  params: 21,
  active_params: 3.6,
  layers: 24,
  kv_heads: 8,
  head_dim: 64,
  hidden_size: 2880,
  local_layers: 12,
  sliding_window: 128,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull gpt-oss:20b',
    hf: 'https://huggingface.co/openai/gpt-oss-20b',
  },
}
