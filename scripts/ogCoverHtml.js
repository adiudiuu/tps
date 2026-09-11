/** Render 1200×630 OG covers that follow public/og-cover.png (white card, mint stats, brand bar). */

export function renderCoverHtml({
    htmlLang,
    kicker,
    headlineBefore,
    headlineMid,
    headlineAfter,
    sub,
    statModels,
    statGpus,
    statLangs,
    models,
    gpus,
    langCount,
    host,
}) {
    const esc = (s) => String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;')

    const headline = `${esc(headlineBefore)}<span class="accent">VRAM</span>${esc(headlineMid)}<span class="accent">TPS</span>${esc(headlineAfter)}`
    const headlinePlain = `${headlineBefore}VRAM${headlineMid}TPS${headlineAfter}`
    const longClass = headlinePlain.length > 28 ? ' long' : ''

    return `<!doctype html>
<html lang="${esc(htmlLang)}">
<head>
  <meta charset="utf-8" />
  <style>
    @page { size: 1200px 630px; margin: 0; }
    html, body { margin: 0; padding: 0; width: 1200px; height: 630px; overflow: hidden; }
    body {
      font-family: Inter, "Noto Sans Display", "WenQuanYi Micro Hei", "Droid Sans Fallback", "Noto Sans CJK SC", sans-serif;
      background: #ffffff;
      color: #0f172a;
      position: relative;
    }
    .bar {
      position: absolute; inset: 0 0 auto 0; height: 8px;
      background: linear-gradient(90deg, #10b981 0%, #38bdf8 100%);
    }
    .blob {
      position: absolute; right: -80px; top: 40px; width: 520px; height: 520px;
      background: radial-gradient(circle at 40% 40%, rgba(16,185,129,0.12), rgba(56,189,248,0.10) 42%, rgba(255,255,255,0) 70%);
      pointer-events: none;
    }
    .card {
      position: relative; z-index: 1;
      box-sizing: border-box;
      width: 1200px; height: 630px;
      padding: 56px 72px 48px;
      display: flex; flex-direction: column;
    }
    .brand { display: flex; align-items: center; gap: 18px; }
    .logo {
      width: 72px; height: 72px; border-radius: 20px; background: #0f172a;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      box-shadow: 0 1px 2px rgba(15,23,42,0.12);
    }
    .logo svg { width: 40px; height: 40px; }
    .brand h1 {
      margin: 0; font-size: 38px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; color: #0f172a;
    }
    .kicker {
      margin: 6px 0 0; font-size: 20px; font-weight: 650; color: #10b981; letter-spacing: 0.01em;
    }
    .headline {
      margin: 48px 0 0;
      font-size: 56px; font-weight: 800; letter-spacing: -0.035em; line-height: 1.18; color: #0f172a;
    }
    .headline.long { font-size: 42px; margin-top: 40px; }
    .headline .accent { color: #059669; }
    .sub {
      margin: 18px 0 0;
      font-size: 26px; font-weight: 500; color: #64748b; line-height: 1.4;
      max-width: 980px;
    }
    .stats {
      display: flex; gap: 20px; margin-top: auto; padding-bottom: 8px;
      width: 72%;
    }
    .stat {
      flex: 1; background: #ecfdf5; border-radius: 22px; padding: 18px 22px 16px;
    }
    .stat .n { font-size: 40px; font-weight: 800; color: #059669; letter-spacing: -0.03em; line-height: 1.1; }
    .stat .l { margin-top: 6px; font-size: 16px; font-weight: 600; color: #64748b; }
    .host {
      position: absolute; right: 72px; bottom: 52px;
      display: flex; align-items: center; gap: 10px;
      font-size: 22px; font-weight: 700; color: #334155;
    }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: #10b981; }
  </style>
</head>
<body>
  <div class="bar"></div>
  <div class="blob"></div>
  <div class="card">
    <div class="brand">
      <div class="logo" aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="none">
          <path d="M18 42L27 33L34 37L46 23" stroke="url(#og-acc)" stroke-linecap="round" stroke-linejoin="round" stroke-width="5"/>
          <path d="M23 19H41" stroke="#e2e8f0" stroke-linecap="round" stroke-width="5"/>
          <path d="M32 19V45" stroke="#e2e8f0" stroke-linecap="round" stroke-width="5"/>
          <circle cx="46" cy="23" r="4" fill="#f8fafc"/>
          <defs>
            <linearGradient id="og-acc" x1="16" y1="18" x2="50" y2="46" gradientUnits="userSpaceOnUse">
              <stop stop-color="#38bdf8"/>
              <stop offset="1" stop-color="#10b981"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div>
        <h1>TPS Calculator</h1>
        <p class="kicker">${esc(kicker)}</p>
      </div>
    </div>
    <div class="headline${longClass}">${headline}</div>
    <p class="sub">${esc(sub)}</p>
    <div class="stats">
      <div class="stat"><div class="n">${esc(models)}</div><div class="l">${esc(statModels)}</div></div>
      <div class="stat"><div class="n">${esc(gpus)}</div><div class="l">${esc(statGpus)}</div></div>
      <div class="stat"><div class="n">${esc(langCount)}</div><div class="l">${esc(statLangs)}</div></div>
    </div>
    <div class="host"><span class="dot"></span>${esc(host)}</div>
  </div>
</body>
</html>`
}
