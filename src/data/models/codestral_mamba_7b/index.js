// Codestral Mamba 7B: Mamba2 SSM architecture, code-specific, 256K ctx
// Source: https://huggingface.co/mistralai/Mamba-Codestral-7B-v0.1
export default {
  id: 'codestral_mamba_7b',
  released: '2024-07',
  name: 'Codestral Mamba 7B',
  type: 'dense',
  params: 7.3,
  layers: 56,
  kv_heads: 0, // Mamba uses SSM, not traditional attention
  head_dim: 0,
  hidden_size: 4096,
  max_ctx: 262144,
  links: {
    ollama: 'ollama pull codestral-mamba:7b',
    hf: 'https://huggingface.co/mistralai/Mamba-Codestral-7B-v0.1',
  },
}
