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

export function getAttentionType(model) {
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
  if (!totalHeads || !Number.isFinite(kvHeads) || kvHeads <= 0) return '—'

  const typeLabel = {
    mha: 'MHA',
    gqa: 'GQA',
    mqa: 'MQA',
    unknown: 'Unknown',
  }[type]

  return `${typeLabel} (${totalHeads}/${kvHeads})`
}
