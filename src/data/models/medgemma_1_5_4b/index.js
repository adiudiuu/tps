// MedGemma 1.5 4B: 医疗领域微调 + 多模态（text + 2D/3D 医学影像）
// 架构基于 Gemma 3 4B 同构 + vision encoder
// 2026-01-13 发布
// 注：vision_seq_tokens 来自 MedGemma 1.5 tech report，使用 SigLIP 视觉编码器
//     2D 影像约 256 patch tokens，3D 体数据可能到 1024+
export default {
  id: 'medgemma_1_5_4b',
  released: '2026-01',
  name: 'MedGemma 1.5 4B',
  type: 'dense',
  params: 4.3,
  layers: 34,
  kv_heads: 4,
  head_dim: 256,
  local_layers: 29,
  sliding_window: 1024,
  hidden_size: 2560,
  max_ctx: 131072,
  vision_seq_tokens: 256,  // SigLIP 视觉编码器，每张 2D 影像约 256 patch tokens
  tags: ['medical', 'multimodal'],
  links: {
    ollama: null,
    hf: 'https://huggingface.co/google/medgemma-1.5-4b-it',
    ms: null,
  },
}
