// 按 GPU 规格选择默认互联：有 NVLink 用对应档位，否则 PCIe，不默认 NVLink 5.0
import { INTERCONNECT_MAP } from '../data/constants.js'

export function defaultPcieInterconnect(gpu) {
  return INTERCONNECT_MAP.find(i => i.id === (gpu?.pcie_gen === 5 ? 'pcie5' : 'pcie4'))
    ?? INTERCONNECT_MAP.find(i => i.id === 'pcie4')
}

/**
 * 根据 gpuCount 与 GPU.nvlink_bw 自动选择互联。
 * 单卡 / 无 NVLink 的消费卡走 PCIe，避免 8×4090 误用 NVLink 5.0。
 */
export function autoInterconnect(gpu, gpuCount = 1) {
  if (!gpu || gpuCount <= 1) return defaultPcieInterconnect(gpu)
  const bw = gpu.nvlink_bw ?? 0
  if (bw >= 1800) return INTERCONNECT_MAP.find(i => i.id === 'nvlink5')
  if (bw >= 900)  return INTERCONNECT_MAP.find(i => i.id === 'nvlink4')
  if (bw >= 600)  return INTERCONNECT_MAP.find(i => i.id === 'nvlink3')
  return defaultPcieInterconnect(gpu)
}

/**
 * 按已还原的 GPU 槽选默认互联：同型号用该卡 NVLink/PCIe，混合卡走 PCIe。
 */
export function autoInterconnectForSlots(slots) {
  if (!slots?.length) return defaultPcieInterconnect(null)
  const total = slots.reduce((s, g) => s + (Number(g.count) || 1), 0)
  const ids = new Set(slots.map(s => s.gpu?.id).filter(Boolean))
  if (ids.size !== 1) return defaultPcieInterconnect(slots[0]?.gpu)
  return autoInterconnect(slots[0].gpu, total)
}
