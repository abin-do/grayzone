import { Link, useParams, Navigate } from 'react-router-dom'
import { getPair, getCharacters } from '../lib/content.js'
import Icon from '../components/Icon.jsx'
import './PairDetail.css'

function ProfileTags({ character }) {
  const tags = [character.gender, [character.height, character.weight].filter(Boolean).join('/'), character.age, character.bloodType].filter(Boolean)
  if (tags.length === 0) return null
  return (
    <div className="pair-member-profile">
      {tags.map((t, i) => (
        <span key={i} className="pair-member-tag">
          {t}
        </span>
      ))}
    </div>
  )
}

export default function PairDetail() {
  const { pairSlug } = useParams()
  const pair = getPair(pairSlug)

  if (!pair) return <Navigate to="/characters" replace />

  const members = (pair.characters || [])
    .map((slug) => getCharacters().find((c) => c.slug === slug))
    .filter(Boolean)

  return (
    <div className="page">
      <div className="panel pair-detail">
        <Link to="/characters" className="back-link">
          <Icon name="arrow_back" size={18} />
          목록으로
        </Link>

        <div className="pair-detail-scene">
          {pair.backgroundUrl && (
            <div
              className="pair-detail-scene-bg"
              style={{ backgroundImage: `url(${pair.backgroundUrl})` }}
            />
          )}
          <div className="pair-detail-scene-gradient" />
          <div className="pair-detail-name">{pair.name}</div>
          <div className="pair-detail-members">
            {members.map((m) => (
              <Link key={m.slug} to={`/characters/pair/${pair.slug}/${m.slug}`} className="pair-member">
                {m.standingUrl && <img className="pair-member-standing" src={m.standingUrl} alt="" />}
                <div className="pair-member-info">
                  {m.quote && <div className="pair-member-quote">"{m.quote}"</div>}
                  <div className="pair-member-name">{m.name}</div>
                  {m.nameKo && <div className="pair-member-name-ko">{m.nameKo}</div>}
                  <ProfileTags character={m} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
