import { Link } from 'react-router-dom'
import { getLogEntries } from '../lib/content.js'
import Icon from '../components/Icon.jsx'
import './LogList.css'

export default function LogList() {
  const entries = getLogEntries()

  return (
    <div className="page">
      <div className="panel">
        {entries.length === 0 ? (
          <div className="empty-state">
            src/content/log/&lt;번호&gt;/ 에 meta.json과 log.txt(또는 log.html)를 추가하면 여기 표시됩니다.
          </div>
        ) : (
          <ul className="log-list">
            {entries.map((entry) => (
              <li key={entry.slug}>
                <Link to={`/log/${entry.slug}`} className="log-row">
                  <span className="log-row-title">{entry.title || `기록 #${entry.slug}`}</span>
                  <Icon name="chevron_right" size={20} className="log-row-chevron" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
