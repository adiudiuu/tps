// GPT-4o: Multimodal model with optimized inference
// Parameters estimated from community reverse engineering
// Source: Community analysis and API behavior patterns
export default {
  id: 'gpt4o',
  released: '2024-05',
  name: 'GPT-4o',
  type: 'moe',
  params: 200,
  active_params: 25,
  experts: 16,
  experts_per_token: 2,
  layers: 64,
  kv_heads: 16,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 128000,
  links: {
    ollama: null,
    hf: null,
    ms: null,
  },
}
