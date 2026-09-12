import { Link } from 'react-router-dom'
import { getCharacters } from '../lib/content.js'
import './Characters.css'

export default function Characters() {
  const characters = getCharacters()

  return (
    <div className="page">
      <div className="panel">
        <div className="page-title">캐릭터 백업</div>
        {characters.length === 0 ? (
          <div className="empty-state">
            src/content/characters/&lt;폴더명&gt;/ 에 meta.json, portrait.* 를 추가하면 여기 표시됩니다.
          </div>
        ) : (
          <div className="character-grid">
            {characters.map((c) => (
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
      </div>
    </div>
  )
}
