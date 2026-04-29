// Llama 3.1 Nemotron 70B: NVIDIA fine-tuned model
// Released: October 2024
// Source: https://huggingface.co/nvidia/Llama-3.1-Nemotron-70B-Instruct-HF
export default {
  id: 'llama3_1_nemotron_70b',
  released: '2024-10',
  name: 'Llama 3.1 Nemotron 70B',
  type: 'dense',
  params: 70.0,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/nvidia/Llama-3.1-Nemotron-70B-Instruct-HF',
  },
}
