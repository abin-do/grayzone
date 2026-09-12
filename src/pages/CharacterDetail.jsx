import { Link, useParams, Navigate } from 'react-router-dom'
import { getCharacter } from '../lib/content.js'
import Icon from '../components/Icon.jsx'
import './CharacterDetail.css'

export default function CharacterDetail() {
  const { slug } = useParams()
  const character = getCharacter(slug)

  if (!character) return <Navigate to="/characters" replace />

  return (
    <div className="page">
      <div className="panel character-detail">
        <Link to="/characters" className="back-link character-detail-back">
          <Icon name="arrow_back" size={18} />
          목록으로
        </Link>
        <div className="character-detail-body">
          {character.standingUrl && (
            <img className="character-detail-standing" src={character.standingUrl} alt="" />
          )}
          <div className="character-detail-info">
            <h1 className="character-detail-name">{character.name}</h1>
            {character.role && <div className="character-detail-role">{character.role}</div>}
            {character.tags?.length > 0 && (
              <div className="character-detail-tags">
                {character.tags.map((tag) => (
                  <span key={tag} className="character-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {character.bio && <p className="character-detail-bio">{character.bio}</p>}
            {character.relationships?.length > 0 && (
              <div className="character-relationships">
                <div className="character-relationships-title">관계</div>
                <ul>
                  {character.relationships.map((r, i) => (
                    <li key={i}>
                      <strong>{r.name}</strong>
                      {r.description ? ` — ${r.description}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
