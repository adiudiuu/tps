import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const modelsDir = path.join(rootDir, 'src', 'data', 'models')

function pickHttpSources(model) {
  const sources = []
  if (typeof model?.links?.hf === 'string') sources.push({ kind: 'hf', url: model.links.hf })
  if (typeof model?.links?.ms === 'string') sources.push({ kind: 'ms', url: model.links.ms })
  return sources
}

async function checkUrl(url) {
  const startedAt = Date.now()
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
    })
    return {
      ok: res.ok,
      status: res.status,
      finalUrl: res.url,
      elapsedMs: Date.now() - startedAt,
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      finalUrl: url,
      elapsedMs: Date.now() - startedAt,
      error: String(error?.message || error),
    }
  }
}

function classifyStatus(status) {
  if (status === 401 || status === 403) return 'restricted'
  if (status === 429) return 'rate_limited'
  if (status >= 500) return 'server_error'
  if (status === 0) return 'network_error'
  if (status >= 400) return 'client_error'
  return 'ok'
}

async function loadAllModels() {
  const entries = await readdir(modelsDir, { withFileTypes: true })
  const folders = entries.filter(e => e.isDirectory()).map(e => e.name).sort()

  const models = []
  for (const folder of folders) {
    const filePath = path.join(modelsDir, folder, 'index.js')
    const mod = await import(pathToFileURL(filePath).href)
    models.push(mod.default)
  }
  return models
}

async function main() {
  const models = await loadAllModels()
  const results = []
  const warnings = []

  for (const model of models) {
    const sources = pickHttpSources(model)
    if (sources.length === 0) {
      results.push({ id: model.id, name: model.name, checks: [] })
      continue
    }

    const checks = []
    for (const source of sources) {
      const check = await checkUrl(source.url)
      checks.push({ kind: source.kind, url: source.url, ...check })
    }

    const okChecks = checks.filter(check => check.ok)
    const modelWarnings = checks
      .filter(check => !check.ok)
      .map(check => ({
        kind: check.kind,
        url: check.url,
        status: check.status,
        category: classifyStatus(check.status),
        error: check.error || null,
      }))

    warnings.push(...modelWarnings.map(w => ({ id: model.id, name: model.name, ...w })))

    results.push({
      id: model.id,
      name: model.name,
      ok: okChecks.length > 0,
      checks,
      warnings: modelWarnings,
    })
  }

  const failedModels = results
    .filter(item => !item.ok)
    .map(item => ({
      id: item.id,
      name: item.name,
      checks: item.checks.map(check => ({
        kind: check.kind,
        status: check.status,
        error: check.error || null,
      })),
    }))

  const report = {
    summary: {
      modelCount: models.length,
      warningCount: warnings.length,
      failedModelCount: failedModels.length,
    },
    warnings,
    failedModels,
    results,
  }

  if (failedModels.length > 0) {
    console.error(JSON.stringify(report, null, 2))
    process.exit(1)
  }

  console.log(JSON.stringify(report, null, 2))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
