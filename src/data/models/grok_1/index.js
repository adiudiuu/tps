// xAI Grok-1: MoE 314B total / 86B active, 64 layers, 8K ctx
// 8 experts per layer, top-2 routing; open-sourced March 2024
// Source: https://github.com/xai-org/grok-1/blob/main/model.py
export default {
  id: 'grok_1',
  released: '2024-03',
  name: 'Grok-1 314B',
  type: 'moe',
  params: 314,
  active_params: 86,
  mla_ratio: null,
  layers: 64,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 6144,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/xai-org/grok-1',
    ms: 'https://modelscope.cn/models/xai-org/grok-1',
  },
}
