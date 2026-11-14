/**
 * 速度徽章：用展示中位单请求 tok/s（singleToks），不用 Max，与 SpeedCard / 分享图一致。
 * @param {number} toks
 * @param {(key: string) => string} [t]
 */
export function speedRating(toks, t = (key) => key) {
  if (toks == null || !Number.isFinite(toks)) {
    return { grade: '—', c1: '#94a3b8', c2: '#475569', label: '', desc: '' }
  }
  if (toks >= 100) {
    return { grade: 'S', c1: '#22c55e', c2: '#15803d', label: t('result.speed_rating_blazing'), desc: t('result.speed_rating_s_desc') }
  }
  if (toks >= 60) {
    return { grade: 'A', c1: '#60a5fa', c2: '#2563eb', label: t('result.speed_rating_blazing'), desc: t('result.speed_rating_blazing_desc') }
  }
  if (toks >= 30) {
    return { grade: 'B', c1: '#fbbf24', c2: '#d97706', label: t('result.speed_rating_smooth'), desc: t('result.speed_rating_smooth_desc') }
  }
  if (toks >= 15) {
    return { grade: 'C', c1: '#a78bfa', c2: '#7c3aed', label: t('result.speed_rating_usable'), desc: t('result.speed_rating_usable_desc') }
  }
  return { grade: 'F', c1: '#f87171', c2: '#dc2626', label: t('result.speed_rating_slow'), desc: t('result.speed_rating_slow_desc') }
}

export function speedRatingFromResult(result, t) {
  return speedRating(result?.singleToks, t)
}
