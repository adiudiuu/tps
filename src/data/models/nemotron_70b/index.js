// NVIDIA Llama-3.1-Nemotron-70B: fine-tune of Llama 3.1 70B, 128K ctx
// Source: https://huggingface.co/nvidia/Llama-3.1-Nemotron-70B-Instruct-HF/blob/main/config.json
export default {
  id: 'nemotron_70b',
  released: '2024-10',
  name: 'Nemotron-70B',
  type: 'dense',
  params: 70.6,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/nvidia/Llama-3.1-Nemotron-70B-Instruct-HF',
    ms: 'https://modelscope.cn/models/nvidia/Llama-3.1-Nemotron-70B-Instruct-HF',
  },
}
