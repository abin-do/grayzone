import { Link, useParams, Navigate } from 'react-router-dom'
import { getSessions } from '../lib/content.js'
import Icon from '../components/Icon.jsx'
import LogViewer from '../components/LogViewer.jsx'
import './SessionDetail.css'

export default function SessionDetail() {
  const { slug } = useParams()
  const sessions = getSessions()
  const index = sessions.findIndex((s) => s.slug === slug)

  if (index === -1) return <Navigate to="/sessions" replace />

  const session = sessions[index]
  const prev = sessions[index - 1]
  const next = sessions[index + 1]

  return (
    <div className="page">
      <div className="panel session-detail">
        <Link to="/sessions" className="back-link">
          <Icon name="arrow_back" size={18} />
          목록으로
        </Link>

        {session.cardUrl && (
          <img className="session-detail-card" src={session.cardUrl} alt="" />
        )}

        <div className="session-detail-header">
          <h1 className="session-detail-title">{session.title}</h1>
          <div className="session-detail-meta">
            {session.releaseDate && <div className="session-detail-date">{session.releaseDate}</div>}
            <div className="session-detail-credits">
              {session.director && (
                <div>
                  <span className="session-meta-label">감독:</span> {session.director}
                </div>
              )}
              {session.cast?.length > 0 && (
                <div>
                  <span className="session-meta-label">출연:</span> {session.cast.join(', ')}
                </div>
              )}
            </div>
          </div>
          {session.synopsis && <p className="session-detail-synopsis">{session.synopsis}</p>}
        </div>

        <LogViewer url={session.logHtmlUrl} />

        <div className="session-detail-nav">
          {prev ? (
            <Link to={`/sessions/${prev.slug}`} className="session-nav-link">
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={`/sessions/${next.slug}`} className="session-nav-link session-nav-link-next">
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  )
}
