import { useEffect, useState } from 'react'
import { marked } from 'marked'

// A single Enter key press should show as a line break, not get swallowed
// (CommonMark otherwise only breaks paragraphs on a blank line).
marked.setOptions({ breaks: true })

// Renders a markdown file fetched from `url` (e.g. appearance.md) as HTML.
export default function Markdown({ url, className }) {
  const [html, setHtml] = useState(null)

  useEffect(() => {
    let cancelled = false
    setHtml(null)
    if (!url) return
    fetch(url)
      .then((res) => res.text())
      .then((md) => {
        if (!cancelled) setHtml(marked.parse(md))
      })
    return () => {
      cancelled = true
    }
  }, [url])

  if (!url) return null
  if (html === null) return <div className="md-loading">불러오는 중...</div>
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
