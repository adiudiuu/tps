// Xwin-LM 70B: fine-tuned Llama 2 70B with multi-stage training
// Released: September 2023
// Source: https://huggingface.co/Xwin-LM/Xwin-LM-70B-V0.1
export default {
  id: 'xwin_70b',
  released: '2023-09',
  name: 'Xwin-LM 70B',
  type: 'dense',
  params: 70.0,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/Xwin-LM/Xwin-LM-70B-V0.1',
  },
}
