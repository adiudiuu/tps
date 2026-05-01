// Command R7B: Cohere's compact Command R model, 128K ctx
// Source: https://huggingface.co/CohereForAI/c4ai-command-r7b-12-2024
export default {
  id: 'command_r7b',
  released: '2024-12',
  name: 'Command R7B',
  type: 'dense',
  params: 7.3,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/CohereForAI/c4ai-command-r7b-12-2024',
    ollama: 'ollama pull command-r7b',
  },
}
