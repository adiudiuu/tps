// Qwen3.5-27B: dense VLM, 64 layers, hybrid Gated DeltaNet + full attention, 256K ctx
// full_attention_interval=4: 48 linear + 16 full; official language=27B, HF total ≈ 28B
// Source: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/config.json
export default {
  id: 'qwen35_27b',
  released: '2026-02',
  name: 'Qwen3.5 27B',
  type: 'dense',
  params: 27,
  layers: 64,
  kv_heads: 4,
  head_dim: 256,
  linear_attention_layers: 48,
  local_layers: 48,
  sliding_window: 0,
  hidden_size: 5120,
  max_ctx: 262144,
  vision_encoder_params: 0.8,
  vision_seq_tokens: 1280,
  tags: ['chat', 'multilingual', 'vision', 'multimodal'],
  links: {
    ollama: 'ollama pull qwen3.5:27b',
    hf: 'https://huggingface.co/Qwen/Qwen3.5-27B',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3.5-27B',
  },
}
