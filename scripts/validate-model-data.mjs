import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const modelsDir = path.join(rootDir, 'src', 'data', 'models')

function isPositiveNumber(v) {
  return typeof v === 'number' && Number.isFinite(v) && v > 0
}

function isValidReleased(v) {
  if (typeof v !== 'string') return false
  const m = /^(\d{4})-(\d{2})$/.exec(v)
  if (!m) return false
  const month = Number(m[2])
  return month >= 1 && month <= 12
}

function sortByReleaseDesc(models) {
  return [...models].sort((a, b) => {
    const [ay, am] = (a.released || '2000-01').split('-').map(Number)
    const [by, bm] = (b.released || '2000-01').split('-').map(Number)
    return by !== ay ? by - ay : bm - am
  })
}

async function loadModelFromFolder(folderName) {
  const filePath = path.join(modelsDir, folderName, 'index.js')
  const mod = await import(pathToFileURL(filePath).href)
  return { folderName, model: mod.default }
}

function validateModel(folderName, model) {
  const issues = []
  const requiredBase = [
    'id',
    'name',
    'type',
    'params',
    'layers',
    'kv_heads',
    'head_dim',
    'hidden_size',
    'max_ctx',
    'released',
    'links',
  ]

  for (const key of requiredBase) {
    if (!(key in model)) issues.push(`missing field: ${key}`)
  }

  if (model.id !== folderName) issues.push(`id mismatch: id=${model.id}, folder=${folderName}`)
  if (!['dense', 'moe'].includes(model.type)) issues.push(`invalid type: ${model.type}`)
  if (!isPositiveNumber(model.params)) issues.push('params must be a positive number')
  if (!Number.isInteger(model.layers) || model.layers <= 0) issues.push('layers must be a positive integer')
  if (!Number.isInteger(model.kv_heads) || model.kv_heads <= 0) issues.push('kv_heads must be a positive integer')
  if (!Number.isInteger(model.head_dim) || model.head_dim <= 0) issues.push('head_dim must be a positive integer')
  if (!Number.isInteger(model.hidden_size) || model.hidden_size <= 0) issues.push('hidden_size must be a positive integer')
  if (!Number.isInteger(model.max_ctx) || model.max_ctx <= 0) issues.push('max_ctx must be a positive integer')
  if (!isValidReleased(model.released)) issues.push('released must match YYYY-MM')

  if (typeof model.links !== 'object' || model.links === null) {
    issues.push('links must be an object')
  } else {
    const hasAnyLink = Boolean(model.links.ollama || model.links.hf || model.links.ms)
    if (!hasAnyLink) issues.push('links should include at least one source link')
  }

  if (model.type === 'moe') {
    if (!isPositiveNumber(model.active_params)) {
      issues.push('moe model must have active_params as a positive number')
    } else if (model.active_params > model.params) {
      issues.push('moe model active_params cannot exceed params')
    }
  }

  return issues
}

async function main() {
  const dirEntries = await readdir(modelsDir, { withFileTypes: true })
  const modelFolders = dirEntries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort()

  const loaded = await Promise.all(modelFolders.map(loadModelFromFolder))

  const issuesByModel = []
  const allModels = []

  for (const { folderName, model } of loaded) {
    allModels.push(model)
    const issues = validateModel(folderName, model)
    if (issues.length > 0) {
      issuesByModel.push({ id: model?.id ?? folderName, issues })
    }
  }

  const idSet = new Set()
  const duplicateIds = []
  for (const m of allModels) {
    if (idSet.has(m.id)) duplicateIds.push(m.id)
    idSet.add(m.id)
  }

  const indexModule = await import(pathToFileURL(path.join(modelsDir, 'index.js')).href)
  const dense = indexModule.DENSE_MODELS || []
  const moe = indexModule.MOE_MODELS || []
  const allFromIndex = indexModule.ALL_MODELS || []

  const allFromFolders = new Set(allModels.map(m => m.id))
  const idsInIndex = new Set([...dense, ...moe].map(m => m.id))

  const missingInIndex = [...allFromFolders].filter(id => !idsInIndex.has(id))
  const extraInIndex = [...idsInIndex].filter(id => !allFromFolders.has(id))

  const sortedIds = sortByReleaseDesc(allFromIndex).map(m => m.id)
  const indexIds = allFromIndex.map(m => m.id)
  const allModelsSorted = JSON.stringify(sortedIds) === JSON.stringify(indexIds)

  const hasIssues =
    issuesByModel.length > 0 ||
    duplicateIds.length > 0 ||
    missingInIndex.length > 0 ||
    extraInIndex.length > 0 ||
    !allModelsSorted

  const report = {
    summary: {
      folderModelCount: allModels.length,
      denseCount: dense.length,
      moeCount: moe.length,
      allCount: allFromIndex.length,
      hasIssues,
    },
    modelIssues: issuesByModel,
    duplicateIds,
    missingInIndex,
    extraInIndex,
    sortCheck: {
      allModelsSorted,
      expectedOrder: sortedIds,
      actualOrder: indexIds,
    },
  }

  if (hasIssues) {
    console.error(JSON.stringify(report, null, 2))
    process.exit(1)
  }

  console.log(JSON.stringify(report, null, 2))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
