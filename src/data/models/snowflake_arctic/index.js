// Snowflake Arctic 480B: dense residual + MoE, 480B total / 17B active, 40 layers, 4K ctx
// Source: https://huggingface.co/Snowflake/snowflake-arctic-instruct/blob/main/config.json
export default {
  id: 'snowflake_arctic',
  released: '2024-04',
  name: 'Snowflake Arctic 480B',
  type: 'moe',
  params: 480,
  active_params: 17,
  experts: 128,
  experts_per_token: 2,
  mla_ratio: null,
  layers: 40,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 7168,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/Snowflake/snowflake-arctic-instruct',
    ms: 'https://modelscope.cn/models/AI-ModelScope/snowflake-arctic-instruct',
  },
}
