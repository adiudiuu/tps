// Cohere Command R+ 104B: dense, 56 layers, 128K ctx
// Source: https://huggingface.co/CohereForAI/c4ai-command-r-plus/blob/main/config.json
export default {
  id: 'command_r_plus_104b',
  released: '2024-04',
  name: 'Command R+ 104B',
  type: 'dense',
  params: 104,
  layers: 56,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 12288,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/CohereForAI/c4ai-command-r-plus',
    ms: 'https://modelscope.cn/models/AI-ModelScope/c4ai-command-r-plus',
  },
}
