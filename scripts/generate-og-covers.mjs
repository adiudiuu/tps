#!/usr/bin/env node
/** Generate public/og-cover.{locale}.png plus default og-cover.png (zh fallback).
 *  Requires Google Chrome. Run from repo root: node scripts/generate-og-covers.mjs
 */
import { writeFile, copyFile, mkdir, rm } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { OG_LOCALES, SITE_HOST, HTML_LANG } from '../src/data/site.js'
import { pageSeo } from './ogHtml.js'
import { renderCoverHtml } from './ogCoverHtml.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')
const chromeBin = process.env.CHROME_PATH || 'google-chrome'

function startStaticServer(pages) {
    return new Promise((resolve) => {
        const server = createServer((req, res) => {
            const key = decodeURIComponent((req.url || '/').replace(/^\//, '').replace(/\.html$/, ''))
            const html = pages.get(key)
            if (!html) {
                res.writeHead(404)
                res.end()
                return
            }
            res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
            res.end(html)
        })
        server.listen(0, '127.0.0.1', () => {
            resolve({ server, port: server.address().port })
        })
    })
}

function launchChrome(profileDir) {
    return new Promise((resolve, reject) => {
        const proc = spawn(chromeBin, [
            '--headless=new',
            '--disable-gpu',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--hide-scrollbars',
            '--force-device-scale-factor=1',
            `--user-data-dir=${profileDir}`,
            '--remote-debugging-port=0',
            '--window-size=1200,630',
            'about:blank',
        ], { stdio: ['ignore', 'pipe', 'pipe'] })

        let buf = ''
        const onData = (d) => {
            buf += d.toString()
            const m = buf.match(/DevTools listening on (ws:\/\/[^\s]+)/)
            if (m) {
                proc.stderr.off('data', onData)
                resolve({ proc, browserWs: m[1].trim() })
            }
        }
        proc.stderr.on('data', onData)
        proc.on('error', reject)
        setTimeout(() => reject(new Error(`chrome did not print DevTools URL\n${buf}`)), 20000)
    })
}

function openCdp(wsUrl) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl)
        let nextId = 0
        const pending = new Map()
        const eventWaiters = []

        ws.addEventListener('message', (ev) => {
            const msg = JSON.parse(String(ev.data))
            if (msg.id != null && pending.has(msg.id)) {
                const { resolve: ok, reject: fail } = pending.get(msg.id)
                pending.delete(msg.id)
                if (msg.error) fail(new Error(`${msg.error.message || JSON.stringify(msg.error)}`))
                else ok(msg.result)
                return
            }
            if (msg.method) {
                for (const w of eventWaiters) {
                    if (w.method === msg.method && (w.sessionId == null || w.sessionId === msg.sessionId)) {
                        w.resolve(msg.params)
                    }
                }
            }
        })
        ws.addEventListener('error', () => reject(new Error(`WebSocket error ${wsUrl}`)))
        ws.addEventListener('open', () => {
            const send = (method, params = {}, sessionId) => {
                const id = ++nextId
                const payload = { id, method, params }
                if (sessionId) payload.sessionId = sessionId
                return new Promise((ok, fail) => {
                    pending.set(id, { resolve: ok, reject: fail })
                    ws.send(JSON.stringify(payload))
                })
            }
            const wait = (method, sessionId, timeoutMs = 15000) => new Promise((ok, fail) => {
                const w = { method, sessionId, resolve: (params) => {
                    w.done = true
                    ok(params)
                } }
                eventWaiters.push(w)
                setTimeout(() => {
                    if (!w.done) fail(new Error(`timeout waiting for ${method}`))
                }, timeoutMs)
            })
            resolve({ send, wait, close: () => ws.close() })
        })
    })
}

const pages = new Map()
for (const locale of OG_LOCALES) {
    const seo = pageSeo(locale)
    pages.set(locale, renderCoverHtml({
        htmlLang: HTML_LANG[locale] || 'en',
        kicker: seo.cover.kicker,
        headlineBefore: seo.cover.headlineBefore,
        headlineMid: seo.cover.headlineMid,
        headlineAfter: seo.cover.headlineAfter,
        sub: seo.cover.sub,
        statModels: seo.cover.statModels,
        statGpus: seo.cover.statGpus,
        statLangs: seo.cover.statLangs,
        models: seo.models,
        gpus: seo.gpus,
        langCount: seo.langCount,
        host: SITE_HOST,
    }))
}

await mkdir(publicDir, { recursive: true })
const { server, port } = await startStaticServer(pages)
const profileDir = join(tmpdir(), `tps-og-chrome-${process.pid}`)
await mkdir(profileDir, { recursive: true })

let chromeProc
let browser
try {
    const launched = await launchChrome(profileDir)
    chromeProc = launched.proc
    browser = await openCdp(launched.browserWs)

    for (const locale of OG_LOCALES) {
        const { targetId } = await browser.send('Target.createTarget', {
            url: 'about:blank',
        })
        const { sessionId } = await browser.send('Target.attachToTarget', {
            targetId,
            flatten: true,
        })
        await browser.send('Page.enable', {}, sessionId)
        await browser.send('Emulation.setDeviceMetricsOverride', {
            width: 1200,
            height: 630,
            deviceScaleFactor: 1,
            mobile: false,
        }, sessionId)
        const loaded = browser.wait('Page.loadEventFired', sessionId)
        await browser.send('Page.navigate', {
            url: `http://127.0.0.1:${port}/${encodeURIComponent(locale)}.html`,
        }, sessionId)
        await loaded
        await new Promise((r) => setTimeout(r, 250))
        const { data } = await browser.send('Page.captureScreenshot', {
            format: 'png',
            clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 },
            captureBeyondViewport: false,
        }, sessionId)
        const pngPath = join(publicDir, `og-cover.${locale}.png`)
        await writeFile(pngPath, Buffer.from(data, 'base64'))
        console.log('wrote', pngPath)
        await browser.send('Target.closeTarget', { targetId }).catch(() => {})
    }

    await copyFile(join(publicDir, 'og-cover.zh.png'), join(publicDir, 'og-cover.png'))
    console.log('wrote', join(publicDir, 'og-cover.png'), '(zh fallback)')
} finally {
    try { browser?.close() } catch { /* ignore */ }
    if (chromeProc && !chromeProc.killed) chromeProc.kill('SIGKILL')
    server.close()
    await new Promise((r) => setTimeout(r, 300))
    await rm(profileDir, { recursive: true, force: true }).catch(() => {})
}
