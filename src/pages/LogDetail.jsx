import { useEffect, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { getLogEntry } from '../lib/content.js'
import Icon from '../components/Icon.jsx'
import './LogDetail.css'

function groupsFromText(text) {
  return text
    .split(/\n\s*\n+/)
    .map((group) =>
      group
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .filter((lines) => lines.length > 0)
}

export default function LogDetail() {
  const { slug } = useParams()
  const entry = getLogEntry(slug)
  const [content, setContent] = useState(null)

  useEffect(() => {
    let cancelled = false
    setContent(null)
    const url = entry?.htmlUrl || entry?.textUrl
    if (!url) return
    fetch(url)
      .then((res) => res.text())
      .then((body) => {
        if (!cancelled) setContent({ kind: entry.htmlUrl ? 'html' : 'text', body })
      })
    return () => {
      cancelled = true
    }
  }, [entry?.htmlUrl, entry?.textUrl])

  if (!entry) return <Navigate to="/log" replace />

  return (
    <div className="page">
      <div className="panel log-detail">
        <Link to="/log" className="back-link">
          <Icon name="arrow_back" size={18} />
          목록으로
        </Link>
        <h1 className="log-detail-title">{entry.title || `기록 #${entry.slug}`}</h1>
        <div className="log-detail-body">
          {content === null ? (
            <div className="log-detail-loading">불러오는 중...</div>
          ) : content.kind === 'html' ? (
            <div dangerouslySetInnerHTML={{ __html: content.body }} />
          ) : (
            groupsFromText(content.body).map((lines, gi) => (
              <div key={gi} className="log-group">
                {lines.map((line, li) => (
                  <p key={li} className="log-paragraph">
                    {line}
                  </p>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
