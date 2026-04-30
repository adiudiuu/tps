// GLM-4V 9B: vision-language model
// Released: June 2024
// Source: https://huggingface.co/THUDM/glm-4v-9b
export default {
  id: 'glm4v_9b',
  released: '2024-06',
  name: 'GLM-4V 9B',
  type: 'dense',
  params: 9.4,
  layers: 40,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 8192,
  // Vision encoder: EVA-CLIP-E ~4.4B params, 40×40=1600 patch tokens per image
  vision_encoder_params: 4.4,
  vision_seq_tokens: 1600,
  links: {
    hf: 'https://huggingface.co/THUDM/glm-4v-9b',
    ms: 'https://modelscope.cn/models/ZhipuAI/glm-4v-9b',
  },
}
