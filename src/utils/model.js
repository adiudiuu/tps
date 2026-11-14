export function getTotalHeads(model) {
  // query_heads 显式优先：Q 投影升维的架构（DeepSeek-V4 / MiMo / Step-3.5 等）
  // num_attention_heads × head_dim ≠ hidden_size，不能从 hidden/head_dim 反推
  const explicit = Number(model?.query_heads)
  if (Number.isFinite(explicit) && explicit > 0) return Math.round(explicit)
  const hiddenSize = Number(model?.hidden_size)
  const headDim = Number(model?.head_dim)
  if (!Number.isFinite(hiddenSize) || !Number.isFinite(headDim) || headDim <= 0) return null
  const totalHeads = hiddenSize / headDim
  if (!Number.isFinite(totalHeads) || totalHeads <= 0) return null
  return Math.round(totalHeads)
}

/** 纯 Mamba/SSM：无标准 attention KV，kv_heads=0 是合法几何，不是坏数据 */
export function isSsmModel(model) {
  if (!model) return false
  if (Number(model.mamba_ratio) === 1) return true
  const kv = Number(model.kv_heads)
  const headDim = Number(model.head_dim)
  const layers = Number(model.layers)
  const linear = Number(model.linear_attention_layers)
  if (Number.isFinite(kv) && kv === 0 && Number.isFinite(headDim) && headDim === 0) return true
  if (Number.isFinite(layers) && layers > 0 && Number.isFinite(linear) && linear === layers) return true
  return false
}

export function isMlaModel(model) {
  const ratio = Number(model?.mla_ratio)
  return Number.isFinite(ratio) && ratio > 0
}

/** 混合注意力（SWA / 线性层 / 部分 Mamba）不按普通 GQA 整除假设告警 */
export function isHybridAttentionModel(model) {
  if (!model) return false
  if (isMlaModel(model) || isSsmModel(model)) return true
  if (model.linear_attention_layers > 0) return true
  if (model.local_layers > 0) return true
  const mamba = Number(model.mamba_ratio)
  return Number.isFinite(mamba) && mamba > 0 && mamba < 1
}

export function getAttentionType(model) {
  if (isMlaModel(model)) return 'mla'
  if (isSsmModel(model)) return 'ssm'
  const kvHeads = Number(model?.kv_heads)
  const totalHeads = getTotalHeads(model)
  if (!Number.isFinite(kvHeads) || kvHeads <= 0 || !totalHeads) return 'unknown'
  if (kvHeads === 1) return 'mqa'
  if (kvHeads >= totalHeads) return 'mha'
  return 'gqa'
}

export function getAttentionSummary(model) {
  const type = getAttentionType(model)
  const kvHeads = Number(model?.kv_heads)
  const totalHeads = getTotalHeads(model)

  if (type === 'ssm') return 'SSM / Mamba'
  if (type === 'mla') {
    const q = totalHeads ?? '—'
    const kv = Number.isFinite(kvHeads) && kvHeads > 0 ? kvHeads : '—'
    return `MLA (${q}/${kv})`
  }
  if (!totalHeads || !Number.isFinite(kvHeads) || kvHeads <= 0) return '—'

  const typeLabel = {
    mha: 'MHA',
    gqa: 'GQA',
    mqa: 'MQA',
    unknown: 'Unknown',
  }[type]

  return `${typeLabel} (${totalHeads}/${kvHeads})`
}

/**
 * 仅对「普通 GQA、非混合、非 MLA、非 SSM」检查 query_heads % kv_heads。
 * 混合架构不强制满足该假设。
 */
export function gqaDivisible(model) {
  if (isHybridAttentionModel(model) || isSsmModel(model) || isMlaModel(model)) return true
  const kv = Number(model?.kv_heads)
  const q = getTotalHeads(model)
  if (!Number.isFinite(kv) || kv <= 0 || !q) return true
  return q % kv === 0
}
