// MythoMax L2 13B: merge of MythoLogic and Huginn for creative writing
// Released: July 2023
// Source: https://huggingface.co/Gryphe/MythoMax-L2-13b
export default {
  id: 'mythomax_13b',
  released: '2023-07',
  name: 'MythoMax L2 13B',
  type: 'dense',
  params: 13.0,
  layers: 40,
  kv_heads: 40,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 4096,
  links: {
    ollama: 'ollama pull mythomax',
    hf: 'https://huggingface.co/Gryphe/MythoMax-L2-13b',
  },
}
