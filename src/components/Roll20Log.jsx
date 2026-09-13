import { useState } from 'react'
import ParenText from './ParenText.jsx'
import { highlightParensHtml } from '../lib/text.js'
import './Roll20Log.css'

// Renders parsed dialogue/narration/media blocks - shared by the Roll20
// archive parser and the .bubble-text/.bubble-name chat-log parser, since
// both produce the same block shape.

function Avatar({ src, name }) {
  const [broken, setBroken] = useState(false)
  if (!src || broken) {
    return <div className="r20-avatar r20-avatar-fallback">{name?.[0] ?? '?'}</div>
  }
  return (
    <img
      className="r20-avatar"
      src={src}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
    />
  )
}

export default function Roll20Log({ blocks }) {
  return (
    <div className="r20-log">
      {blocks.map((block, i) => {
        if (block.type === 'narration') {
          return (
            <p key={i} className="r20-narration">
              <ParenText text={block.text} />
            </p>
          )
        }
        if (block.type === 'media') {
          return (
            <div key={i} className="r20-media">
              {block.images.map((src, j) => (
                <img key={j} src={src} alt="" loading="lazy" referrerPolicy="no-referrer" />
              ))}
            </div>
          )
        }
        return (
          <div key={i} className={'r20-row' + (block.isYou ? ' r20-row-you' : '')}>
            <Avatar src={block.avatarUrl} name={block.speaker} />
            <div className="r20-body">
              {block.speaker && <div className="r20-name">{block.speaker}</div>}
              {block.lines.map((line, j) => {
                if (line.kind === 'table') {
                  return (
                    <div
                      key={j}
                      className="r20-table-wrap"
                      dangerouslySetInnerHTML={{ __html: line.value }}
                    />
                  )
                }
                if (line.kind === 'html') {
                  return (
                    <p
                      key={j}
                      className="r20-line"
                      dangerouslySetInnerHTML={{ __html: highlightParensHtml(line.value) }}
                    />
                  )
                }
                return (
                  <p key={j} className="r20-line">
                    <ParenText text={line.value} />
                  </p>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
