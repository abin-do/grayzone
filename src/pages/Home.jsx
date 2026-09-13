import { useEffect, useState } from 'react'
import { getNarratives, findCharacterByName } from '../lib/content.js'
import { loadNarrativeScripts } from '../lib/script.js'
import ParenText from '../components/ParenText.jsx'
import './Home.css'

function pickRandomStart(scripts) {
  if (scripts.length === 0) return null
  const scriptIndex = Math.floor(Math.random() * scripts.length)
  const stepIndex = Math.floor(Math.random() * scripts[scriptIndex].steps.length)
  return { scriptIndex, stepIndex }
}

export default function Home() {
  const [scripts, setScripts] = useState(null)
  const [cursor, setCursor] = useState(null)

  useEffect(() => {
    let cancelled = false
    loadNarrativeScripts(getNarratives()).then((loaded) => {
      if (cancelled) return
      setScripts(loaded)
      setCursor(pickRandomStart(loaded))
    })
    return () => {
      cancelled = true
    }
  }, [])

  const advance = () => {
    if (!scripts || !cursor) return
    const current = scripts[cursor.scriptIndex]
    const nextStep = cursor.stepIndex + 1
    if (nextStep < current.steps.length) {
      setCursor({ scriptIndex: cursor.scriptIndex, stepIndex: nextStep })
    } else {
      // reached the end of this piece - start a fresh random piece
      setCursor(pickRandomStart(scripts))
    }
  }

  const step = cursor ? scripts[cursor.scriptIndex].steps[cursor.stepIndex] : null
  const character = step?.speaker ? findCharacterByName(step.speaker) : null

  return (
    <div className="vn-scene">
      {character?.standingUrl ? (
        <img className="vn-standing" src={character.standingUrl} alt={character.name} />
      ) : (
        <div className="vn-standing vn-standing-placeholder">캐릭터 스탠딩</div>
      )}

      <button type="button" className="vn-dialogue" onClick={advance} disabled={!step}>
        {step ? (
          <>
            {step.speaker && <span className="vn-nameplate">{step.speaker}</span>}
            {step.speaker && <span className="vn-divider" />}
            <span className="vn-text">
              <ParenText text={step.text} />
            </span>
            <span className="vn-hint">▶</span>
          </>
        ) : (
          <span className="vn-text vn-text-empty">
            {scripts === null
              ? '불러오는 중...'
              : 'src/content/narratives/ 에 log.html 을 추가하면 이곳에 대사가 표시됩니다.'}
          </span>
        )}
      </button>
    </div>
  )
}
