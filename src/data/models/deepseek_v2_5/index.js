// DeepSeek V2.5: MoE with MLA, 60 layers, 128K ctx
// Same architecture as DeepSeek V2; combines V2-Chat and V2-Coder capabilities
// Source: https://huggingface.co/deepseek-ai/DeepSeek-V2.5/blob/main/config.json
export default {
  id: 'deepseek_v2_5',
  released: '2024-09',
  name: 'DeepSeek V2.5',
  type: 'moe',
  params: 236,
  active_params: 21,
  mla_ratio: 0.18,
  layers: 60,
  kv_heads: 128,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-V2.5',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-V2.5',
  },
}
