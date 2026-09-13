import { useEffect, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { getCharacter, getPair } from '../lib/content.js'
import Icon from '../components/Icon.jsx'
import Markdown from '../components/Markdown.jsx'
import './CharacterDetail.css'

function BioHtml({ url, className }) {
  const [html, setHtml] = useState(null)

  useEffect(() => {
    let cancelled = false
    setHtml(null)
    fetch(url)
      .then((res) => res.text())
      .then((t) => {
        if (!cancelled) setHtml(t)
      })
    return () => {
      cancelled = true
    }
  }, [url])

  if (html === null) return <div className="character-bio-loading">불러오는 중...</div>
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

function Section({ title, children }) {
  return (
    <section className="character-section">
      <h2 className="character-section-title">{title}</h2>
      {children}
    </section>
  )
}

// A prose field can come from a .md file (preferred - no JSON escaping) or a
// plain string in meta.json.
function ProseSection({ title, mdUrl, text, secret }) {
  if (!mdUrl && !text) return null
  const proseClass = 'character-prose character-markdown' + (secret ? ' character-prose-secret' : '')
  return (
    <Section title={title}>
      {mdUrl ? (
        <Markdown url={mdUrl} className={proseClass} />
      ) : (
        <p className={proseClass}>{text}</p>
      )}
    </Section>
  )
}

export default function CharacterDetail() {
  const { slug, pairSlug } = useParams()
  const character = getCharacter(slug)
  const pair = pairSlug ? getPair(pairSlug) : null

  if (!character) return <Navigate to="/characters" replace />

  const profileTags = [
    character.gender,
    [character.height, character.weight].filter(Boolean).join('/'),
    character.age,
    character.bloodType,
  ].filter(Boolean)

  const backTo = pair ? `/characters/pair/${pair.slug}` : '/characters'
  const partner =
    pair && character.partnerSlug ? getCharacter(character.partnerSlug) : null

  return (
    <div className="page">
      <div className="panel character-detail">
        <div className="character-detail-topbar">
          <Link to={backTo} className="back-link">
            <Icon name="arrow_back" size={18} />
            {pair ? pair.name : '목록으로'}
          </Link>
          {pair && (
            <div className="character-tabs">
              {[character, partner].filter(Boolean).map((m) => (
                <Link
                  key={m.slug}
                  to={`/characters/pair/${pair.slug}/${m.slug}`}
                  className={'character-tab' + (m.slug === character.slug ? ' is-active' : '')}
                >
                  {m.sdUrl ? (
                    <img src={m.sdUrl} alt={m.name} />
                  ) : (
                    <span className="character-tab-fallback">{m.name?.[0] ?? '?'}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="character-detail-body">
          {character.standingUrl && (
            <img className="character-detail-standing" src={character.standingUrl} alt="" />
          )}
          <div className="character-detail-info">
            {character.quote && <div className="character-quote">"{character.quote}"</div>}
            <h1 className="character-detail-name">{character.name}</h1>
            {character.nameKo && <div className="character-name-ko">{character.nameKo}</div>}
            {character.role && <div className="character-detail-role">{character.role}</div>}

            {profileTags.length > 0 && (
              <div className="character-profile-tags">
                {profileTags.map((t, i) => (
                  <span key={i} className="character-profile-tag">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {character.tags?.length > 0 && (
              <div className="character-detail-tags">
                {character.tags.map((tag) => (
                  <span key={tag} className="character-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {(character.family || character.school) && (
              <div className="character-brief">
                {character.family && <div>{character.family}</div>}
                {character.school && <div>{character.school}</div>}
              </div>
            )}

            {character.bioHtmlUrl ? (
              <BioHtml url={character.bioHtmlUrl} className="character-detail-bio" />
            ) : (
              character.bio && <p className="character-detail-bio">{character.bio}</p>
            )}

            <ProseSection
              title="외관 서술"
              mdUrl={character.appearanceMdUrl}
              text={character.appearance}
            />

            {character.stats?.length > 0 && (
              <Section title="스탯">
                <div className="character-stats">
                  {character.stats.map((s, i) => (
                    <div key={i} className="character-stat">
                      <span className="character-stat-label">{s.label}</span>
                      <span className="character-stat-value">{s.value}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <ProseSection
              title="성격"
              mdUrl={character.personalityMdUrl}
              text={character.personality}
            />

            <ProseSection
              title="기타사항"
              mdUrl={character.etcMdUrl}
              text={character.etc || character.secrets}
            />

            <ProseSection title="비밀설정" mdUrl={character.secretMdUrl} text={character.secret} secret />

            {character.questions?.length > 0 && (
              <Section title="캐릭터 이입 질문">
                <dl className="character-qna">
                  {character.questions.map((qa, i) => (
                    <div key={i} className="character-qna-item">
                      <dt>{qa.q}</dt>
                      <dd>{qa.a}</dd>
                    </div>
                  ))}
                </dl>
              </Section>
            )}

            {character.skills?.length > 0 && (
              <Section title="스킬">
                <ul className="character-skills">
                  {character.skills.map((s, i) => (
                    <li key={i}>
                      <strong>{s.name}</strong>
                      {s.desc ? ` — ${s.desc}` : ''}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {character.relationships?.length > 0 && (
              <Section title="관계">
                <ul className="character-relationships-list">
                  {character.relationships.map((r, i) => (
                    <li key={i}>
                      <strong>{r.name}</strong>
                      {r.description ? ` — ${r.description}` : ''}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {(character.sdUrl || character.headUrl) && (
              <div className="character-thumbs">
                {character.sdUrl && (
                  <div className="character-thumb">
                    <img src={character.sdUrl} alt="" />
                    <span>SD</span>
                  </div>
                )}
                {character.headUrl && (
                  <div className="character-thumb">
                    <img src={character.headUrl} alt="" />
                    <span>HEAD</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
