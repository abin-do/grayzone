// Roll20 "Chat Archive" HTML export -> our own light/dark-safe chat model.
//
// Roll20's export hardcodes inline colors (e.g. color:#333333) that assume a
// white page background, so dropping it into a dark panel makes the text
// unreadable. Instead of fighting inline-style specificity, we throw the
// original styling away and re-render with our own components.
//
// One exception: character-sheet roll templates (dice result tables, e.g.
// "sheet-rolltemplate-coc-1") are real <table> markup with their own
// self-contained pass/fail background colors - flattening those to text
// turns a clean table into a jumbled run-on string. Those are kept as a
// 'table' line and rendered as HTML instead.

export function looksLikeRoll20Archive(html) {
  return html.includes('textchatcontainer') || /class="message(?=[\s"])/.test(html)
}

function absolutize(src) {
  if (!src) return null
  return src.startsWith('/') ? 'https://app.roll20.net' + src : src
}

let colorCtx = null

// Roll20 roll templates set a background color per cell (pass/fail, etc.)
// but never a matching text color - they rely on the site's own CSS for
// that, which we don't load. Compute proper contrast per cell instead of
// guessing at a fixed set of color names, so any sheet's palette works.
function relativeLuminance(colorStr) {
  if (!colorCtx) colorCtx = document.createElement('canvas').getContext('2d')
  colorCtx.fillStyle = '#000'
  colorCtx.fillStyle = colorStr
  const normalized = colorCtx.fillStyle
  let r, g, b
  if (normalized[0] === '#') {
    r = parseInt(normalized.slice(1, 3), 16)
    g = parseInt(normalized.slice(3, 5), 16)
    b = parseInt(normalized.slice(5, 7), 16)
  } else {
    const m = normalized.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (!m) return 1
    ;[r, g, b] = [m[1], m[2], m[3]].map(Number)
  }
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function fixRollTemplateContrast(root) {
  root.querySelectorAll('[style]').forEach((el) => {
    const bg = el.style.backgroundColor
    if (!bg) return
    el.style.color = relativeLuminance(bg) < 0.45 ? '#ffffff' : '#1c1c1e'
  })
}

// Extracts one message's body as a single line: a dice roll template
// becomes a 'table' line (HTML kept as-is), everything else becomes plain
// text (safe against arbitrary inline styles/colors from the export).
function extractLine(el) {
  const clone = el.cloneNode(true)
  clone.querySelectorAll('.spacer, .avatar, .tstamp, .by, .clear').forEach((n) => n.remove())

  const rollTemplate = clone.querySelector('[class*="sheet-rolltemplate"]')
  if (rollTemplate) {
    fixRollTemplateContrast(rollTemplate)
    return { kind: 'table', value: rollTemplate.outerHTML }
  }

  const text = clone.textContent.replace(/\s+/g, ' ').trim()
  return text ? { kind: 'text', value: text } : null
}

export function parseRoll20Archive(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const messageEls = doc.querySelectorAll('div.message')

  const blocks = []
  let current = null

  for (const el of messageEls) {
    const cls = el.className || ''
    if (cls.includes('whisper') || cls.includes('hidden-message')) continue

    if (cls.includes('desc')) {
      current = null
      const imgs = Array.from(el.querySelectorAll('img'))
        .map((img) => absolutize(img.getAttribute('src')))
        .filter(Boolean)
      if (imgs.length > 0) {
        blocks.push({ type: 'media', images: imgs })
        continue
      }
      const text = el.textContent.replace(/\s+/g, ' ').trim()
      if (text) blocks.push({ type: 'narration', text })
      continue
    }

    const avatarImg = el.querySelector(':scope > div.avatar img')
    const avatarUrl = absolutize(avatarImg?.getAttribute('src'))
    const bySpan = el.querySelector(':scope > span.by')
    const speaker = bySpan ? bySpan.textContent.replace(/:\s*$/, '').trim() : null

    const line = extractLine(el)
    if (!line) continue

    const isYou = cls.includes('you')

    if (speaker || avatarUrl) {
      current = { type: 'dialogue', speaker: speaker || '', avatarUrl, isYou, lines: [line] }
      blocks.push(current)
    } else if (current && current.type === 'dialogue') {
      current.lines.push(line)
    } else {
      if (line.kind === 'text') blocks.push({ type: 'narration', text: line.value })
    }
  }

  return blocks
}
