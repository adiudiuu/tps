// DeepSeek V2 Lite: MoE with MLA, 16B total / 2.4B active, 27 layers, 32K ctx
// Source: https://huggingface.co/deepseek-ai/DeepSeek-V2-Lite/blob/main/config.json
export default {
  id: 'deepseek_v2_lite',
  released: '2024-05',
  name: 'DeepSeek V2 Lite',
  type: 'moe',
  params: 15.7,
  active_params: 2.4,
  experts: 64,
  experts_per_token: 6,
  mla_ratio: 0.18,
  layers: 27,
  kv_heads: 64,
  head_dim: 128,
  hidden_size: 2048,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-V2-Lite',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-V2-Lite',
    ollama: 'https://ollama.com/library/deepseek-v2',
  },
}
