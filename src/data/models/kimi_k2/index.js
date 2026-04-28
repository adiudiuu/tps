// Kimi K2: MoE + MLA, 61层, 384路由专家 top-8 + 1共享专家, 1T总参数, 32B激活
// MLA: kv_lora_rank=512, q_lora_rank=1536, v_head_dim=128
// Source: https://huggingface.co/moonshotai/Kimi-K2-Instruct/blob/main/config.json
export default {
  id: 'kimi_k2',
  released: '2025-07',
  name: 'Kimi K2 (MoE)',
  type: 'moe',
  params: 1000,
  active_params: 32,
  mla_ratio: 0.18,
  layers: 61,
  kv_heads: 1,
  head_dim: 512,
  hidden_size: 7168,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull kimi-k2',
    hf: 'https://huggingface.co/moonshotai/Kimi-K2-Instruct',
    ms: 'https://modelscope.cn/models/moonshotai/Kimi-K2-Instruct',
  },
}
