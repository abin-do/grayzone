// Roll20 "Chat Archive" HTML export -> our own light/dark-safe chat model.
//
// Roll20's export hardcodes inline colors (e.g. color:#333333) that assume a
// white page background, so dropping it into a dark panel makes the text
// unreadable. Instead of fighting inline-style specificity, we throw the
// original styling away and re-render with our own components.

export function looksLikeRoll20Archive(html) {
  return html.includes('textchatcontainer') || /class="message(?=[\s"])/.test(html)
}

function absolutize(src) {
  if (!src) return null
  return src.startsWith('/') ? 'https://app.roll20.net' + src : src
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

    const clone = el.cloneNode(true)
    clone.querySelectorAll('.spacer, .avatar, .tstamp, .by, .clear').forEach((n) => n.remove())
    const text = clone.textContent.replace(/\s+/g, ' ').trim()
    if (!text) continue

    const isYou = cls.includes('you')

    if (speaker || avatarUrl) {
      current = { type: 'dialogue', speaker: speaker || '', avatarUrl, isYou, lines: [text] }
      blocks.push(current)
    } else if (current && current.type === 'dialogue') {
      current.lines.push(text)
    } else {
      blocks.push({ type: 'narration', text })
    }
  }

  return blocks
}
