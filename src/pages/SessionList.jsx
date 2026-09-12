import { Link } from 'react-router-dom'
import { getSessions } from '../lib/content.js'
import './SessionList.css'

export default function SessionList() {
  const sessions = getSessions()

  return (
    <div className="page">
      <div className="panel">
        <div className="page-title">세션 로그 백업</div>
        {sessions.length === 0 ? (
          <div className="empty-state">
            src/content/sessions/&lt;폴더명&gt;/ 에 meta.json, card.*, log.html 을 추가하면 여기 표시됩니다.
          </div>
        ) : (
          <ul className="session-list">
            {sessions.map((session) => (
              <li key={session.slug} className="session-row">
                <Link to={`/sessions/${session.slug}`} className="session-link">
                  {session.cardUrl && (
                    <img className="session-thumb" src={session.cardUrl} alt="" width={280} />
                  )}
                  <div className="session-info">
                    <h2 className="session-title">{session.title}</h2>
                    {session.synopsis && <p className="session-synopsis">{session.synopsis}</p>}
                    <div className="session-meta">
                      {session.director && (
                        <div>
                          <span className="session-meta-label">감독</span>
                          {session.director}
                        </div>
                      )}
                      {session.cast?.length > 0 && (
                        <div>
                          <span className="session-meta-label">출연</span>
                          {session.cast.join(', ')}
                        </div>
                      )}
                    </div>
                    {session.releaseDate && (
                      <div className="session-date">개봉일: {session.releaseDate}</div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
