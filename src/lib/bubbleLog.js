// A second recognized log format: a hand-made "KakaoTalk style" chat page
// using .message-block / .bubble-name / .bubble-text (with an optional
// .reverse modifier for the other side of the conversation). Produces the
// same block shape parseRoll20Archive does, so it reuses the same renderer.

export function looksLikeBubbleLog(html) {
  return html.includes('bubble-text') && html.includes('bubble-name')
}

// Some export templates tack the account handle onto the display name
// (e.g. "이하람 @fsaeaq149270"), or leave stray @mentions (reply-chain
// artifacts) inside the message body - strip both so IDs never show up.
function stripHandle(text) {
  return text
    .replace(/@[\w.]+/g, '')
    .replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>')
    .trim()
}

export function parseBubbleLog(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const blocks = []

  doc.querySelectorAll('.message-block').forEach((el) => {
    const speaker = stripHandle(el.querySelector('.bubble-name')?.textContent || '')
    const avatarUrl = el.querySelector('img')?.getAttribute('src') || null
    const lines = Array.from(el.querySelectorAll('.bubble-text'))
      .map((b) => stripHandle(b.innerHTML))
      .filter(Boolean)
    if (lines.length === 0) return
    blocks.push({
      type: 'dialogue',
      speaker,
      avatarUrl,
      isYou: el.classList.contains('reverse'),
      raw: true,
      lines,
    })
  })

  return blocks
}
