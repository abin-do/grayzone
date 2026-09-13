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
  const [text, setText] = useState(null)

  useEffect(() => {
    let cancelled = false
    setText(null)
    if (!entry?.textUrl) return
    fetch(entry.textUrl)
      .then((res) => res.text())
      .then((t) => {
        if (!cancelled) setText(t)
      })
    return () => {
      cancelled = true
    }
  }, [entry?.textUrl])

  if (!entry) return <Navigate to="/narratives" replace />

  const groups = text ? groupsFromText(text) : []

  return (
    <div className="page">
      <div className="panel log-detail">
        <Link to="/narratives" className="back-link">
          <Icon name="arrow_back" size={18} />
          목록으로
        </Link>
        <h1 className="log-detail-title">{entry.title || `기록 #${entry.slug}`}</h1>
        <div className="log-detail-body">
          {text === null ? (
            <div className="log-detail-loading">불러오는 중...</div>
          ) : (
            groups.map((lines, gi) => (
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
