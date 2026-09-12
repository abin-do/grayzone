import { useEffect, useRef, useState } from 'react'
import { looksLikeRoll20Archive, parseRoll20Archive } from '../lib/roll20.js'
import { looksLikeBubbleLog, parseBubbleLog } from '../lib/bubbleLog.js'
import Roll20Log from './Roll20Log.jsx'
import './LogViewer.css'

const isFullDocument = (html) => /<!doctype html|<html[\s>]/i.test(html)

function RawHtmlFrame({ html }) {
  const frameRef = useRef(null)
  const [height, setHeight] = useState(480)

  const handleLoad = () => {
    const doc = frameRef.current?.contentDocument
    if (doc) setHeight(doc.documentElement.scrollHeight + 24)
  }

  return (
    <iframe
      ref={frameRef}
      srcDoc={html}
      onLoad={handleLoad}
      title="log"
      className="log-viewer-frame"
      style={{ height }}
    />
  )
}

export default function LogViewer({ url }) {
  const [content, setContent] = useState(null)

  useEffect(() => {
    let cancelled = false
    setContent(null)
    if (!url) return
    fetch(url)
      .then((res) => res.text())
      .then((text) => {
        if (cancelled) return
        if (looksLikeRoll20Archive(text)) {
          setContent({ kind: 'blocks', blocks: parseRoll20Archive(text) })
        } else if (looksLikeBubbleLog(text)) {
          setContent({ kind: 'blocks', blocks: parseBubbleLog(text) })
        } else if (isFullDocument(text)) {
          setContent({ kind: 'frame', html: text })
        } else {
          setContent({ kind: 'raw', html: text })
        }
      })
    return () => {
      cancelled = true
    }
  }, [url])

  if (!url) return null
  if (content === null) return <div className="log-viewer-loading">불러오는 중...</div>
  if (content.kind === 'blocks') return <Roll20Log blocks={content.blocks} />
  if (content.kind === 'frame') return <RawHtmlFrame html={content.html} />
  return <div className="log-viewer-raw" dangerouslySetInnerHTML={{ __html: content.html }} />
}
