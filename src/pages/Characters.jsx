import { Link } from 'react-router-dom'
import { getCharacters, getPairs } from '../lib/content.js'
import './Characters.css'

export default function Characters() {
  const pairs = getPairs()
  const paired = new Set(pairs.flatMap((p) => p.characters || []))
  const standalone = getCharacters().filter((c) => !paired.has(c.slug))

  return (
    <div className="page">
      <div className="panel">
        {pairs.length === 0 && standalone.length === 0 ? (
          <div className="empty-state">
            src/content/pairs/&lt;폴더명&gt;/ 에 meta.json, background.* 를 추가하거나
            src/content/characters/&lt;폴더명&gt;/ 에 meta.json, portrait.*를 추가하면 여기 표시됩니다.
          </div>
        ) : (
          <>
            {pairs.length > 0 && (
              <div className="pair-list">
                {pairs.map((pair) => {
                  const members = (pair.characters || [])
                    .map((slug) => getCharacters().find((c) => c.slug === slug))
                    .filter(Boolean)
                  return (
                    <Link key={pair.slug} to={`/characters/pair/${pair.slug}`} className="pair-card">
                      {pair.backgroundUrl && (
                        <img className="pair-card-bg" src={pair.backgroundUrl} alt="" />
                      )}
                      <div className="pair-card-shade" />
                      <div className="pair-card-sds">
                        {members.map((m) =>
                          m.sdUrl ? (
                            <img key={m.slug} className="pair-card-sd" src={m.sdUrl} alt={m.name} />
                          ) : (
                            <div key={m.slug} className="pair-card-sd pair-card-sd-fallback">
                              {m.name?.[0] ?? '?'}
                            </div>
                          ),
                        )}
                      </div>
                      <div className="pair-card-info">
                        <div className="pair-card-name">{pair.name}</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            {standalone.length > 0 && (
              <div className="character-grid">
                {standalone.map((c) => (
                  <Link key={c.slug} to={`/characters/${c.slug}`} className="character-card">
                    {c.portraitUrl && <img src={c.portraitUrl} alt="" />}
                    <div className="character-card-overlay">
                      <div className="character-card-name">{c.name}</div>
                      {c.role && <div className="character-card-role">{c.role}</div>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
