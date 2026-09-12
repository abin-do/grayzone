import { Link } from 'react-router-dom'
import { getNarratives } from '../lib/content.js'
import Icon from '../components/Icon.jsx'
import './NarrativeList.css'

export default function NarrativeList() {
  const narratives = getNarratives()

  return (
    <div className="page">
      <div className="panel">
        <div className="page-title">서사 로그 백업</div>
        {narratives.length === 0 ? (
          <div className="empty-state">
            src/content/narratives/ 에 .html 파일을 추가하면 여기 표시됩니다.
          </div>
        ) : (
          <ul className="narrative-list">
            {narratives.map((n) => (
              <li key={n.slug}>
                <Link to={`/narratives/${n.slug}`} className="narrative-row">
                  <span className="narrative-title">{n.title}</span>
                  <Icon name="chevron_right" size={20} className="narrative-chevron" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
