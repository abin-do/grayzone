import { Link, useParams, Navigate } from 'react-router-dom'
import { getNarrative } from '../lib/content.js'
import Icon from '../components/Icon.jsx'
import LogViewer from '../components/LogViewer.jsx'
import './NarrativeDetail.css'

export default function NarrativeDetail() {
  const { slug } = useParams()
  const narrative = getNarrative(slug)

  if (!narrative) return <Navigate to="/narratives" replace />

  return (
    <div className="page">
      <div className="panel narrative-detail">
        <Link to="/narratives" className="back-link">
          <Icon name="arrow_back" size={18} />
          목록으로
        </Link>
        <h1 className="narrative-detail-title">{narrative.title}</h1>
        <LogViewer url={narrative.logHtmlUrl} />
      </div>
    </div>
  )
}
