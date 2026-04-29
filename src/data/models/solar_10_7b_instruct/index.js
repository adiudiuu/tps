// SOLAR 10.7B Instruct: depth up-scaled Llama 2 with instruction tuning
// Released: December 2023
// Source: https://huggingface.co/upstage/SOLAR-10.7B-Instruct-v1.0
export default {
  id: 'solar_10_7b_instruct',
  released: '2023-12',
  name: 'SOLAR 10.7B Instruct',
  type: 'dense',
  params: 10.7,
  layers: 48,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    ollama: 'ollama pull solar',
    hf: 'https://huggingface.co/upstage/SOLAR-10.7B-Instruct-v1.0',
  },
}
