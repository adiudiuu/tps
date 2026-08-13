import zh from '../src/i18n/zh.js'
import * as OpenCC from 'opencc-js'
import { writeFileSync } from 'fs'

const converter = OpenCC.Converter({ from: 'cn', to: 'tw' })

const AFTER = [
  ['內存帶寬', '記憶體頻寬'],
  ['內存頻寬', '記憶體頻寬'],
  ['顯存帶寬', '顯存頻寬'],
  ['物理內存', '實體記憶體'],
  ['系統內存', '系統記憶體'],
  ['共享內存', '共享記憶體'],
  ['激活內存', '活化記憶體'],
  ['激活參數', '活躍參數'],
  ['集成顯卡', '內建顯卡'],
  ['官方文檔', '官方文件'],
  ['無法運行', '無法執行'],
  ['可運行', '可執行'],
  ['運行參數', '執行參數'],
  ['內存', '記憶體'],
  ['帶寬', '頻寬'],
  ['數據', '資料'],
  ['信息', '資訊'],
  ['支持', '支援'],
  ['運行', '執行'],
  ['配置', '設定'],
  ['設置', '設定'],
  ['搜索', '搜尋'],
  ['文檔', '文件'],
  ['芯片', '晶片'],
  ['實時', '即時'],
  ['默認', '預設'],
  ['質量', '品質'],
  ['軟件', '軟體'],
  ['硬件', '硬體'],
  ['網絡', '網路'],
  ['緩存', '快取'],
  ['代碼', '程式碼'],
  ['算法', '演算法'],
  ['兼容', '相容'],
  ['屏幕', '螢幕'],
  ['鼠標', '滑鼠'],
  ['硬盤', '硬碟'],
  ['打印', '列印'],
  ['刷新', '重新整理'],
  ['佔用', '佔用'],
  ['并发', '並行'],
  ['併發', '並行'],
  ['設定推薦', '設定建議'],
  ['窗口', '視窗'],
  ['高級', '進階'],
  ['自定義', '自訂'],
  ['引數', '參數'],
  ['吸吐', '吞吐'],
  ['解除安裝', '卸載'],
  ['區域性', '局部'],
  ['釋出', '發布'],
  ['擴充套件', '擴展'],
  ['自迴歸', '自回歸'],
  ['顯示卡', '顯卡'],
  ['視訊記憶體', '顯存'],
  ['官方檔案', '官方文件'],
  ['點選', '點擊'],
  ['字首', '前綴'],
  ['啟用參數', '活躍參數'],
  ['啟用值', '活化值'],
  ['啟用記憶體', '活化記憶體'],
  ['專案', '項目'],
  ['型別', '類型'],
  ['當前', '目前'],
  ['優化', '最佳化'],
]

function convertStr(s) {
  let out = converter(s)
  for (const [a, b] of AFTER) out = out.split(a).join(b)
  return out
}

function convert(obj) {
  if (typeof obj === 'string') return convertStr(obj)
  if (Array.isArray(obj)) return obj.map(convert)
  if (obj && typeof obj === 'object') {
    const o = {}
    for (const [k, v] of Object.entries(obj)) o[k] = convert(v)
    return o
  }
  return obj
}

function dump(value, indent) {
  const pad = '  '.repeat(indent)
  const pad2 = '  '.repeat(indent + 1)
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'number' || typeof value === 'boolean' || value == null) return String(value)
  if (Array.isArray(value)) {
    if (!value.length) return '[]'
    return '[\n' + value.map(v => pad2 + dump(v, indent + 1)).join(',\n') + '\n' + pad + ']'
  }
  const keys = Object.keys(value)
  const lines = keys.map(k => {
    const key = /^[A-Za-z_][A-Za-z0-9_]*$/.test(k) ? k : JSON.stringify(k)
    return pad2 + key + ': ' + dump(value[k], indent + 1)
  })
  return '{\n' + lines.join(',\n') + ',\n' + pad + '}'
}

const tw = convert(zh)
writeFileSync(new URL('../src/i18n/zh-TW.js', import.meta.url), '// src/i18n/zh-TW.js\nexport default ' + dump(tw, 0) + '\n', 'utf8')
console.log('ok', tw.nav.title, '|', tw.about.intro.slice(0, 40), '|', tw.run.cpu_offload, '|', tw.library.parameters)
