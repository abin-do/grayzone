// Splits plain text on parenthesized segments so callers can render the
// parenthesized parts (stage directions / inner thoughts) in a muted color,
// distinct from spoken lines.
const PAREN_RE = /(\([^()]*\))/g

export function splitParens(text) {
  return text.split(PAREN_RE).filter((part) => part !== '')
}

export function isParenSegment(part) {
  return part.startsWith('(') && part.endsWith(')')
}

// Same idea, but for a raw HTML string (e.g. a bubble-log line that may
// contain <br> tags) - wraps parenthesized text in a span instead of
// producing React nodes. Safe here because these lines only ever contain
// <br> tags interspersed with plain text, never markup with "(" or ")" in
// an attribute.
export function highlightParensHtml(html) {
  return html.replace(PAREN_RE, '<span class="paren-muted">$1</span>')
}
