// CogVLM2 19B: vision-language understanding model
// Released: May 2024
// Source: https://huggingface.co/THUDM/cogvlm2-llama3-chat-19B
export default {
  id: 'cogvlm2_19b',
  released: '2024-05',
  name: 'CogVLM2 19B',
  type: 'dense',
  params: 19.0,
  layers: 48,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/THUDM/cogvlm2-llama3-chat-19B',
    ms: 'https://modelscope.cn/models/ZhipuAI/cogvlm2-llama3-chat-19B',
  },
}
