import { splitParens, isParenSegment } from '../lib/text.js'

// Renders text with (parenthesized) segments in a muted color.
export default function ParenText({ text }) {
  return splitParens(text).map((part, i) =>
    isParenSegment(part) ? (
      <span key={i} className="paren-muted">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}
