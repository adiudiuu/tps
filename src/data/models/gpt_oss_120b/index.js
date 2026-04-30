// gpt-oss-120b: MoE, 36 layers, 128 experts top-4, GQA 64Q/8KV, sliding_window=128 (every 2nd layer)
// 117B total params, 5.1B active params
// Source: https://huggingface.co/openai/gpt-oss-120b/blob/main/original/config.json
export default {
  id: 'gpt_oss_120b',
  released: '2025-08',
  name: 'GPT-OSS 120B',
  type: 'moe',
  params: 117,
  active_params: 5.1,
  experts: 128,
  experts_per_token: 4,
  layers: 36,
  kv_heads: 8,
  head_dim: 64,
  hidden_size: 2880,
  local_layers: 18,
  sliding_window: 128,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull gpt-oss:120b',
    hf: 'https://huggingface.co/openai/gpt-oss-120b',
  },
}
