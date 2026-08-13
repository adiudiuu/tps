/**
 * 分层残差校准表（乘在 Roofline tok/s 上）。
 *
 * 不是 15×12 格子：没测过的键保持 1，不会用邻格插值。
 * 拟合靶是当前主流核（2026/08/13）：llama.cpp 2025 FA/mmq、现行 vLLM/SGLang/MLX。
 * 2024 llama-bench 小模型只当说明，不当硬约束。改表请重跑拟合，不要手填未测组合。
 *
 * 键约定：
 * - framework[fw].decode|prefill
 * - gpuClass['fw|gpu_class'].decode|prefill
 * - arch['fw|arch'].decode|prefill
 * - batchBin['fw|batch_bin'].decode
 * - llamacppTp：llama.cpp 且 tp>1 且 dense_70b 的 decode 额外系数
 */
export const CALIBRATION_FACTORS = {
  framework: {
    llamacpp: { decode: 1.16, prefill: 1.36 },
    llamacpp_metal: { decode: 0.96, prefill: 1.086 },
    vllm: { decode: 0.92 },
    mlx: { prefill: 0.92 },
  },
  gpuClass: {
    'llamacpp|hbm': { decode: 0.80, prefill: 0.52 },
    'llamacpp|gddr_consumer': { decode: 1.10, prefill: 1.22 },
    'llamacpp|gddr_pro': { prefill: 1.50 },
  },
  arch: {
    'llamacpp|dense_70b': { decode: 0.78, prefill: 0.54 },
    'llamacpp_metal|dense_70b': { decode: 1.20, prefill: 0.92 },
    'vllm|dense_mid': { decode: 1.50 },
    'mlx|dense_mid': { decode: 1.32 },
    'mlx|dense_70b': { decode: 1.50 },
    'mlx|moe': { prefill: 0.84 },
  },
  batchBin: {
    'trtllm|high': { decode: 0.78 },
  },
  llamacppTp: 0.73,
}
