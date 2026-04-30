// Phi-3.5 MoE 41.9B (6.6B active): 32 layers, GQA (32 heads / 8 KV heads), 16 experts (2 active), 128K ctx
// Source: https://huggingface.co/microsoft/Phi-3.5-MoE-instruct/blob/main/config.json
export default {
  id: 'phi3_5_moe',
  released: '2024-08',
  name: 'Phi-3.5 MoE 42B',
  type: 'moe',
  params: 41.9,
  active_params: 6.6,
  experts: 16,
  experts_per_token: 2,
  mla_ratio: null,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/microsoft/Phi-3.5-MoE-instruct',
    ms: 'https://modelscope.cn/models/LLM-Research/Phi-3.5-MoE-instruct',
  },
}
