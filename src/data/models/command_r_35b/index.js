// Cohere Command R 35B: dense, 40 layers, 128K ctx
// Source: https://huggingface.co/CohereForAI/c4ai-command-r-v01/blob/main/config.json
export default {
  id: 'command_r_35b',
  released: '2024-03',
  name: 'Command R 35B',
  type: 'dense',
  params: 35,
  layers: 40,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/CohereForAI/c4ai-command-r-v01',
    ms: 'https://modelscope.cn/models/AI-ModelScope/c4ai-command-r-v01',
  },
}
